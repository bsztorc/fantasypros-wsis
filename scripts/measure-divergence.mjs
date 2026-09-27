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
 * A panel of expert rankings is reconstructed from FantasyPros' published dispersion, because
 * individual expert rankings are not published in bulk. Each simulated expert carries a
 * persistent lean, so their ranking hangs together across players instead of being independent
 * noise.
 *
 * REPORTED AS A RANGE, AND THAT IS NOT HEDGING.
 *
 * The published dispersion constrains a panel without determining it, so any one reconstruction
 * is one of many consistent with the same data. A single run produced 13.7% for the flex tier
 * and reporting that as the rate would have been reporting a property of the seed. The same
 * tier runs from roughly 14% to 30% across the grid below.
 *
 * What survives every reconstruction is the ordering, which is the actual finding: the flex
 * decision diverges far more often than the top of any position. That holds in all
 * twenty-four runs, and it is the claim the feature rests on.
 *
 * Quote ranges from this script. Do not quote a single figure from it.
 *
 * Run with: npm run check:divergence
 */

import { readFile } from "node:fs/promises";

const EXPERTS = 46;

/**
 * The grid the range is measured over.
 *
 * Correlation is how much of a rank comes from the expert's own lean rather than
 * player-specific noise. The prototype itself runs at 0.45; the outer two values are here to
 * show the finding does not depend on that choice. Seeds are arbitrary and fixed, so the range
 * is reproducible.
 */
const CORRELATIONS = [0.25, 0.45, 0.65];
const SEEDS = [20260925, 1, 7777, 20261001, 424242, 8675309, 31337, 90210];

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

function buildExpertRankings(players, correlation, seed) {
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

function measure(players, rankings, startN = 2) {
  let total = 0;
  let diverged = 0;
  for (let i = 0; i < players.length; i++)
    for (let j = i + 1; j < players.length; j++)
      for (let k = j + 1; k < players.length; k++) {
        const ids = [players[i].id, players[j].id, players[k].id];
        const votes = new Map(ids.map((id) => [id, 0]));
        const included = new Map(ids.map((id) => [id, 0]));
        for (const ranking of rankings) {
          let best = null;
          for (const id of ids) if (best === null || ranking.get(id) < ranking.get(best)) best = id;
          votes.set(best, votes.get(best) + 1);
          const top = [...ids].sort((a, b) => ranking.get(a) - ranking.get(b)).slice(0, startN);
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

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Measure one tier across the whole grid.
 *
 * `source` is the list the panel is reconstructed over, which is not the same as the tier
 * being measured: an expert ranks the whole board, and the tier is a slice of it.
 */
function sweep(source, players) {
  const rates = [];
  let cases = 0;
  for (const correlation of CORRELATIONS) {
    for (const seed of SEEDS) {
      const result = measure(players, buildExpertRankings(source, correlation, seed));
      rates.push(result.pct);
      cases = result.total;
    }
  }
  return {
    low: Math.min(...rates),
    mid: median(rates),
    high: Math.max(...rates),
    cases,
    dispersion: players.reduce((s, p) => s + p.deviation, 0) / players.length,
  };
}

function header(title) {
  console.log(`\n${title}`);
  console.log(
    `  ${"Tier".padEnd(24)}${"N".padStart(4)}${"Range".padStart(16)}${"Median".padStart(9)}` +
      `${"Cases".padStart(8)}${"Dispersion".padStart(12)}`,
  );
  console.log("  " + "-".repeat(72));
}

function line(label, source, players) {
  const r = sweep(source, players);
  const range = `${r.low.toFixed(1)} - ${r.high.toFixed(1)}%`;
  const thin = r.cases < 100 ? "  (thin sample)" : "";
  console.log(
    `  ${label.padEnd(24)}${String(players.length).padStart(4)}${range.padStart(16)}` +
      `${(r.mid.toFixed(1) + "%").padStart(9)}${String(r.cases).padStart(8)}` +
      `${r.dispersion.toFixed(2).padStart(12)}${thin}`,
  );
}

const runs = CORRELATIONS.length * SEEDS.length;
console.log(`Week ${data.week} ${data.season}, ${EXPERTS} reconstructed expert rankings`);
console.log("Three players from the same tier, filling two slots.");
console.log(
  `Range across ${CORRELATIONS.length} correlation settings and ${SEEDS.length} seeds, ${runs} reconstructions per tier.`,
);

header("BLOCKS OF 12 - one starting slot per team");
for (const [position, bands] of Object.entries(TIERS_12)) {
  const list = data.positions[position];
  bands.forEach(([low, high], index) =>
    line(`${position}${index + 1} (${low}-${high})`, list, list.slice(low - 1, high)),
  );
}

const flexList = data.positions.FLEX;
header("FLEX - split into two tiers");
for (const tier of FLEX_TIERS) {
  const pool = flexList.filter((p) => {
    const band = tier.bands[p.position];
    if (!band) return false;
    const rank = positionalRank(p);
    return rank >= band[0] && rank <= band[1];
  });
  line(tier.label, flexList, pool);
}
console.log();
