/**
 * Choose the sixteen players for the demo roster.
 *
 * The roster has to do a job beyond looking plausible: some combination within it must
 * genuinely diverge, so the feature can be shown working rather than described. This
 * searches real Week 3 players for a roster that contains divergent comparisons, using the
 * application's own engine rather than a copy of it.
 *
 * Run with: npx tsx scripts/pick-roster.ts
 */

import { recommend } from "../src/lib/engine";
import { list, type RankedPlayer } from "../src/lib/rankings";

/** A believable twelve-team roster: one QB, four RB, eight WR, one TE, plus K and DST. */
const SHAPE = { QB: 1, RB: 4, WR: 8, TE: 1, K: 1, DST: 1 };

/** Draw from tiers a real manager would hold: a couple of starters, the rest mid-board. */
function slice(name: "QB" | "RB" | "WR" | "TE" | "K" | "DST", from: number, to: number) {
  return list(name).slice(from, to);
}

const roster: RankedPlayer[] = [
  ...slice("QB", 6, 7),
  ...slice("RB", 0, 1),
  ...slice("RB", 9, 11),
  ...slice("RB", 26, 27),
  ...slice("WR", 3, 4),
  ...slice("WR", 14, 16),
  ...slice("WR", 24, 29),
  ...slice("TE", 8, 9),
  ...slice("K", 13, 14),
  ...slice("DST", 0, 1),
];

console.log(`Roster (${roster.length} players)\n`);
for (const p of roster) {
  console.log(
    `  ${p.posRank.padEnd(6)} ${p.name.padEnd(20)} ${(p.position + " - " + p.team).padEnd(11)} ` +
      `${(p.opponent ?? "").padEnd(9)} avg ${String(p.average).padStart(6)}  sd ${p.deviation}`,
  );
}

// Which three-player combinations from this roster diverge at start 2?
const flexEligible = roster.filter((p) => ["RB", "WR", "TE"].includes(p.position));
const divergent: string[] = [];
const tied: string[] = [];
let agreed = 0;
let tested = 0;

for (let i = 0; i < flexEligible.length; i++) {
  for (let j = i + 1; j < flexEligible.length; j++) {
    for (let k = j + 1; k < flexEligible.length; k++) {
      const trio = [flexEligible[i], flexEligible[j], flexEligible[k]];
      const result = recommend(trio, 2, "balanced");
      if (!result) continue;
      tested += 1;

      const label = trio.map((p) => p.name).join(" / ");
      const picked = result.results.filter((r) => r.recommended).map((r) => r.player.name);

      if (result.diverges) {
        const fc = result.firstChoicePick.map((p) => p.name);
        divergent.push(`${label}\n       shown order picks  ${fc.join(" + ")}\n       engine picks       ${picked.join(" + ")}`);
      } else if (result.indistinguishable) {
        const shown = result.results.map((r) => `${r.player.name} ${r.firstChoiceShare}%`).join(", ");
        tied.push(`${label}\n       shown today        ${shown}\n       engine picks       ${picked.join(" + ")}`);
      } else {
        agreed += 1;
      }
    }
  }
}

console.log(`\nOf ${tested} three-player combinations at start 2:`);
console.log(`  ${divergent.length} diverge, where the shown order would pick a different pair`);
console.log(`  ${tied.length} are undecidable, where the contenders are tied on first-choice votes`);
console.log(`  ${agreed} agree\n`);

console.log("DIVERGENT");
for (const d of divergent.slice(0, 3)) console.log(`  ${d}\n`);
console.log("UNDECIDABLE ON THE CURRENT DISPLAY");
for (const t of tied.slice(0, 5)) console.log(`  ${t}\n`);
