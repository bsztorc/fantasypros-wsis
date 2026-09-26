/**
 * Find a realistic flex decision to demonstrate the feature.
 *
 * The comparison has to be one a manager would genuinely have: players in the flex range
 * who cannot all be started. FLEX1 is the tier they agonise over, the better half of RB3
 * alongside the whole of WR3.
 *
 * Run with: npx tsx scripts/find-demo-case.ts
 */

import { recommend } from "../src/lib/engine";
import { list, type RankedPlayer } from "../src/lib/rankings";

const positionalRank = (p: RankedPlayer) => Number(String(p.posRank).replace(/\D/g, ""));

const flexOne = list("FLEX").filter((p) => {
  const rank = positionalRank(p);
  if (p.position === "RB") return rank >= 25 && rank <= 30;
  if (p.position === "WR") return rank >= 25 && rank <= 36;
  return false;
});

console.log(`FLEX1 pool: ${flexOne.length} players`);
console.log(flexOne.map((p) => `${p.name} (${p.posRank})`).join(", "));

interface Candidate {
  names: string;
  kind: "diverges" | "undecidable";
  shown: string;
  wouldStart: string;
  picks: string;
  spread: number;
}

const found: Candidate[] = [];

for (let i = 0; i < flexOne.length; i++)
  for (let j = i + 1; j < flexOne.length; j++)
    for (let k = j + 1; k < flexOne.length; k++) {
      const trio = [flexOne[i], flexOne[j], flexOne[k]];
      const r = recommend(trio, 2, "balanced");
      if (!r) continue;
      if (!r.diverges && !r.indistinguishable) continue;

      const shares = r.results.map((x) => x.firstChoiceShare);
      found.push({
        names: trio.map((p) => `${p.name} (${p.posRank})`).join(" / "),
        kind: r.diverges ? "diverges" : "undecidable",
        shown: r.results.map((x) => `${x.player.name} ${x.firstChoiceShare}%`).join(", "),
        wouldStart: r.results.map((x) => `${x.player.name} ${x.inclusionShare}%`).join(", "),
        picks: r.results.filter((x) => x.recommended).map((x) => x.player.name).join(" + "),
        spread: Math.max(...shares) - Math.min(...shares),
      });
    }

const diverging = found.filter((c) => c.kind === "diverges");
const undecidable = found.filter((c) => c.kind === "undecidable");
console.log(`\n${diverging.length} diverge, ${undecidable.length} undecidable, out of ${(flexOne.length * (flexOne.length - 1) * (flexOne.length - 2)) / 6} combinations\n`);

// The best demo is the one where the shown percentages look most settled but are not.
console.log("DIVERGENT, tightest first-choice spread first");
for (const c of diverging.sort((a, b) => a.spread - b.spread).slice(0, 6)) {
  console.log(`\n  ${c.names}`);
  console.log(`    shown today   ${c.shown}`);
  console.log(`    would start   ${c.wouldStart}`);
  console.log(`    engine picks  ${c.picks}`);
}
