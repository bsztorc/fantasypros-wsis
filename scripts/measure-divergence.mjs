/**
 * How often does the expert-preferred pair differ from the top two by first-choice share?
 *
 * Measured the way a manager meets the decision. In a twelve-team league the top twelve
 * at a position are everyone's starter at that slot, the next twelve are the second
 * starter, and so on. People choose between players at the same slot, not across the
 * board, so a comparison spanning tiers tells us nothing.
 *
 * Flex is not its own tier. It is filled from the players who did not make a positional
 * starting slot, which in practice means RB3, RB4, WR3 and WR4, compared against each
 * other across positions.
 *
 * Nobody starts a third quarterback, so QB stops at QB2.
 *
 * Ballots are reconstructed from FantasyPros' published dispersion because individual
 * ballots are not published in bulk. Each simulated expert carries a persistent lean, so
 * their ballot hangs together across players instead of being independent noise.
 */

import { readFile } from "node:fs/promises";

const EXPERTS = 46;
const CORRELATION = 0.45;
const SEED = 20260925;

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

function measure(players, ballots, startN = 2) {
  let total = 0;
  let diverged = 0;
  for (let i = 0; i < players.length; i++)
    for (let j = i + 1; j < players.length; j++)
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
        const fc = [...ids].sort((a, b) => votes.get(b) - votes.get(a)).slice(0, startN);
        const inc = [...ids].sort((a, b) => included.get(b) - included.get(a)).slice(0, startN);
        total += 1;
        if (new Set(fc).size !== new Set([...fc, ...inc]).size) diverged += 1;
      }
  return { total, diverged, pct: total ? (diverged / total) * 100 : 0 };
}

const data = JSON.parse(await readFile("src/lib/fixtures/rankings-week3.json", "utf8"));
const posNumber = (p) => Number(String(p.posRank).replace(/\D/g, ""));

/** Flex candidates: the FLEX list, restricted to players in a given positional band. */
function flexBand(fromRank, toRank) {
  return data.positions.FLEX.filter((p) => {
    if (p.position !== "RB" && p.position !== "WR") return false;
    const n = posNumber(p);
    return n >= fromRank && n <= toRank;
  });
}

function row(label, players, ballots) {
  const r = measure(players, ballots);
  const dispersion = players.reduce((s, p) => s + p.deviation, 0) / players.length;
  return { label, n: players.length, pct: r.pct, diverged: r.diverged, total: r.total, dispersion };
}

function print(title, rows) {
  console.log(`\n${title}`);
  console.log(`  ${"Tier".padEnd(22)}${"Players".padStart(8)}${"Diverge".padStart(10)}${"Cases".padStart(14)}${"Dispersion".padStart(12)}`);
  console.log(`  ${"-".repeat(64)}`);
  for (const r of rows) {
    const flag = r.total < 20 ? "  (too few to quote)" : "";
    console.log(
      `  ${r.label.padEnd(22)}${String(r.n).padStart(8)}${(r.pct.toFixed(1) + "%").padStart(10)}` +
        `${(r.diverged + "/" + r.total).padStart(14)}${r.dispersion.toFixed(2).padStart(12)}${flag}`,
    );
  }
}

// ---- Blocks of 12 -------------------------------------------------------
const rows12 = [];
for (const [pos, tiers] of [["QB", 2], ["RB", 4], ["WR", 4], ["TE", 2]]) {
  const list = data.positions[pos];
  const ballots = buildBallots(list, CORRELATION, SEED);
  for (let t = 0; t < tiers; t++) {
    const block = list.slice(t * 12, t * 12 + 12);
    if (block.length >= 3) rows12.push(row(`${pos}${t + 1} (${t * 12 + 1}-${t * 12 + block.length})`, block, ballots));
  }
}
const flexBallots = buildBallots(data.positions.FLEX, CORRELATION, SEED);
rows12.push(row("FLEX shallow (RB3/WR3)", flexBand(25, 36), flexBallots));
rows12.push(row("FLEX deep (RB4/WR4)", flexBand(37, 48), flexBallots));
print("BLOCKS OF 12 - one starter slot per team in a 12-team league", rows12);

// ---- Blocks of 24 -------------------------------------------------------
const rows24 = [];
for (const [pos, tiers] of [["QB", 1], ["RB", 2], ["WR", 2], ["TE", 1]]) {
  const list = data.positions[pos];
  const ballots = buildBallots(list, CORRELATION, SEED);
  for (let t = 0; t < tiers; t++) {
    const block = list.slice(t * 24, t * 24 + 24);
    if (block.length >= 3) rows24.push(row(`${pos}${t + 1} (${t * 24 + 1}-${t * 24 + block.length})`, block, ballots));
  }
}
rows24.push(row("FLEX (RB3-4/WR3-4)", flexBand(25, 48), flexBallots));
print("BLOCKS OF 24 - two starter slots per team in a 12-team league", rows24);
console.log();
