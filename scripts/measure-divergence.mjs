/**
 * How often does the expert-preferred combination differ from the top N by first-choice
 * share?
 *
 * Measured within realistic roster tiers rather than across the whole board. In a
 * twelve-team league the top twelve at a position are everyone's starter at that slot,
 * the next twelve are the second starter, and so on. Managers choose between players in
 * the same tier: your RB2 against your RB3, or three flex candidates. A comparison
 * spanning tiers is lopsided and tells us nothing.
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
const LEAGUE_SIZE = 12;

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

/**
 * Ballots are built over the whole position list, not per tier, so an expert's opinion of
 * a player does not change depending on which comparison we are looking at.
 */
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
  return { total, diverged, pct: total ? (diverged / total) * 100 : 0 };
}

const data = JSON.parse(await readFile("src/lib/fixtures/rankings-week3.json", "utf8"));

function report(listName, players, blockSize) {
  const ballots = buildBallots(players, CORRELATION, 20260925);
  const rows = [];
  for (let start = 0; start + 3 <= players.length; start += blockSize) {
    const block = players.slice(start, start + blockSize);
    if (block.length < 3) break;
    const result = measure(block, ballots, 2);
    const dispersion = block.reduce((s, p) => s + p.deviation, 0) / block.length;
    rows.push({
      tier: `${listName}${Math.floor(start / blockSize) + 1}`,
      range: `${start + 1}-${start + block.length}`,
      pct: result.pct,
      diverged: result.diverged,
      total: result.total,
      dispersion,
    });
  }
  return rows;
}

for (const blockSize of [LEAGUE_SIZE, LEAGUE_SIZE * 2]) {
  console.log(`\n${"=".repeat(64)}`);
  console.log(`Blocks of ${blockSize}  (${blockSize === LEAGUE_SIZE ? "one starter slot per team" : "two starter slots per team"})`);
  console.log(`Three players from the same tier, filling two slots`);
  console.log("=".repeat(64));

  for (const [listName, key, limit] of [
    ["QB", "QB", 48],
    ["RB", "RB", 48],
    ["WR", "WR", 48],
    ["TE", "TE", 36],
    ["FLEX", "FLEX", 96],
  ]) {
    const players = data.positions[key].slice(0, limit);
    const rows = report(listName, players, blockSize);
    if (!rows.length) continue;
    console.log(`\n  ${listName}`);
    for (const r of rows) {
      console.log(
        `    ${r.tier.padEnd(7)} ranks ${r.range.padEnd(7)} ${r.pct.toFixed(1).padStart(5)}%  ` +
          `(${String(r.diverged).padStart(4)}/${String(r.total).padStart(4)})   dispersion ${r.dispersion.toFixed(2)}`,
      );
    }
  }
}
console.log();
