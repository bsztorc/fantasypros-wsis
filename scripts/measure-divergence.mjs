/**
 * How often does the expert-preferred pair differ from the top two by first-choice share?
 *
 * Measured the way a manager meets the decision, in a twelve-team league.
 *
 * Tiers follow how rosters and rankings actually work rather than even blocks:
 *   QB  three tiers, capped at 32, because only 32 quarterbacks start in the NFL
 *   RB  three tiers; beyond RB36 a back is not a startable option
 *   WR  four tiers, because wide receivers go deeper than any other position
 *   TE  two tiers; nobody starts a third-tier tight end
 *
 * Flex is not a tier of its own. It is filled from the players who missed a positional
 * starting slot, and splits in two: the tier a manager is genuinely torn over, and the
 * remainder that can legally fill the slot.
 *
 * Ballots are reconstructed from FantasyPros' published dispersion because individual
 * ballots are not published in bulk. Each simulated expert carries a persistent lean, so
 * their ballot hangs together across players instead of being independent noise.
 *
 * Run with: node scripts/measure-divergence.mjs
 */

import { readFile } from "node:fs/promises";

const EXPERTS = 46;
const CORRELATION = 0.45;
const SEED = 20260925;

/** Tiers as a twelve-team league fills them. */
const TIERS_12 = {
  QB: [[1, 12], [13, 24], [25, 32]],
  RB: [[1, 12], [13, 24], [25, 36]],
  WR: [[1, 12], [13, 24], [25, 36], [37, 48]],
  TE: [[1, 12], [13, 24]],
};

/**
 * Flex split into two tiers.
 *
 * The first is what a manager is genuinely torn over: the better half of RB3 alongside
 * the whole of WR3. The second is everything else that can legally fill the slot.
 */
const FLEX_TIERS = [
  { label: "FLEX1 (top RB3 + all WR3)", bands: { RB: [25, 30], WR: [25, 36] } },
  { label: "FLEX2 (rest of RB3, WR4, TE2)", bands: { RB: [31, 36], WR: [37, 48], TE: [13, 24] } },
];

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
const positionalRank = (p) => Number(String(p.posRank).replace(/\D/g, ""));

function header(title) {
  console.log(`\n${title}`);
  console.log(`  ${"Tier".padEnd(24)}${"N".padStart(4)}${"Diverge".padStart(9)}${"Cases".padStart(14)}${"Dispersion".padStart(12)}`);
  console.log("  " + "-".repeat(63));
}

function line(label, players, ballots) {
  const result = measure(players, ballots);
  const dispersion = players.reduce((s, p) => s + p.deviation, 0) / players.length;
  const thin = result.total < 100 ? "  (thin sample)" : "";
  console.log(
    `  ${label.padEnd(24)}${String(players.length).padStart(4)}${(result.pct.toFixed(1) + "%").padStart(9)}` +
      `${(result.diverged + "/" + result.total).padStart(14)}${dispersion.toFixed(2).padStart(12)}${thin}`,
  );
}

function runTiers(title, tiers) {
  header(title);
  for (const [position, bands] of Object.entries(tiers)) {
    const list = data.positions[position];
    const ballots = buildBallots(list, CORRELATION, SEED);
    bands.forEach(([low, high], index) =>
      line(`${position}${index + 1} (${low}-${high})`, list.slice(low - 1, high), ballots),
    );
  }
}

console.log(`Week ${data.week} ${data.season}, ${EXPERTS} reconstructed ballots`);
console.log("Three players from the same tier, filling two slots.");

runTiers("BLOCKS OF 12 - one starting slot per team", TIERS_12);

const flexList = data.positions.FLEX;
const flexBallots = buildBallots(flexList, CORRELATION, SEED);
header("FLEX - split into two tiers");
for (const tier of FLEX_TIERS) {
  const pool = flexList.filter((p) => {
    const band = tier.bands[p.position];
    if (!band) return false;
    const rank = positionalRank(p);
    return rank >= band[0] && rank <= band[1];
  });
  line(tier.label, pool, flexBallots);
}
console.log();
