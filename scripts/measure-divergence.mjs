/**
 * How often does the expert-preferred combination differ from the top N by first-choice
 * share?
 *
 * This is the validation question in the brief, answered against the Week 3 snapshot
 * rather than proposed as a test for someone else to run later.
 *
 * Ballots are reconstructed from FantasyPros' published dispersion (best, worst, average
 * and standard deviation per player) because individual ballots are not published in
 * bulk. Each simulated expert carries a persistent lean, so their ballot hangs together
 * across players instead of being independent noise.
 *
 * Run with: node scripts/measure-divergence.mjs
 */

import { readFile } from "node:fs/promises";

const EXPERTS = 46;

/** How much of a rank comes from the expert's lean rather than player-specific noise. */
const CORRELATION = 0.45;

function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBallots(players, correlation, seed) {
  const rng = mulberry(seed);
  const normal = () => {
    const u = Math.max(rng(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
  };
  const styles = Array.from({ length: EXPERTS }, () => normal());
  const spread = players.reduce((sum, p) => sum + p.deviation, 0) / players.length || 1;

  return styles.map((style) => {
    const scored = players.map((player) => {
      const lean = style * (player.deviation / spread);
      const offset =
        player.deviation * (correlation * lean + Math.sqrt(1 - correlation ** 2) * normal());
      return { id: player.id, raw: Math.min(player.worst, Math.max(player.best, player.average + offset)) };
    });
    scored.sort((a, b) => a.raw - b.raw);
    const ranking = new Map();
    scored.forEach((entry, index) => ranking.set(entry.id, index + 1));
    return ranking;
  });
}

/** Divergence rate across every three-player combination in `players`. */
function measure(players, ballots, startN) {
  let total = 0;
  let diverged = 0;

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      for (let k = j + 1; k < players.length; k++) {
        const ids = [players[i].id, players[j].id, players[k].id];
        const votes = new Map(ids.map((id) => [id, 0]));
        const included = new Map(ids.map((id) => [id, 0]));

        for (const ballot of ballots) {
          let best = null;
          for (const id of ids) if (best === null || ballot.get(id) < ballot.get(best)) best = id;
          votes.set(best, votes.get(best) + 1);
          const top = [...ids].sort((a, b) => ballot.get(a) - ballot.get(b)).slice(0, startN);
          for (const id of top) included.set(id, included.get(id) + 1);
        }

        const byFirstChoice = [...ids].sort((a, b) => votes.get(b) - votes.get(a)).slice(0, startN);
        const byInclusion = [...ids].sort((a, b) => included.get(b) - included.get(a)).slice(0, startN);

        total += 1;
        if (new Set(byFirstChoice).size !== new Set([...byFirstChoice, ...byInclusion]).size) diverged += 1;
      }
    }
  }
  return { total, diverged, pct: (diverged / total) * 100 };
}

const data = JSON.parse(await readFile("src/lib/fixtures/rankings-week3.json", "utf8"));
const flex = data.positions.FLEX;

console.log(`Week ${data.week} ${data.season}, ${EXPERTS} reconstructed ballots\n`);

console.log("Headline: any three of the FLEX top 60, filling two slots");
const headline = measure(flex.slice(0, 60), buildBallots(flex.slice(0, 60), CORRELATION, 20260925), 2);
console.log(`  ${headline.pct.toFixed(1)}%  (${headline.diverged} of ${headline.total})\n`);

console.log("By tier, which is what users actually compare");
for (const [label, slice] of [
  ["FLEX 1-20", flex.slice(0, 20)],
  ["FLEX 21-60", flex.slice(20, 60)],
  ["FLEX 61-120", flex.slice(60, 120)],
]) {
  const result = measure(slice, buildBallots(slice, CORRELATION, 20260925), 2);
  const dispersion = slice.reduce((sum, p) => sum + p.deviation, 0) / slice.length;
  console.log(`  ${label.padEnd(12)} ${result.pct.toFixed(1).padStart(5)}%   average dispersion ${dispersion.toFixed(2)}`);
}

console.log("\nSensitivity, to show the number is not an artefact of the model");
for (const correlation of [0.2, 0.45, 0.7]) {
  const r = measure(flex.slice(0, 60), buildBallots(flex.slice(0, 60), correlation, 20260925), 2);
  console.log(`  correlation ${correlation}   ${r.pct.toFixed(1)}%`);
}
for (const seed of [11, 22, 33]) {
  const r = measure(flex.slice(0, 60), buildBallots(flex.slice(0, 60), CORRELATION, seed), 2);
  console.log(`  seed ${String(seed).padEnd(11)} ${r.pct.toFixed(1)}%`);
}
