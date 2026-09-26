/**
 * Does the engine still reproduce a number FantasyPros publishes?
 *
 * The only external check available: their comparison page for Hampton against Hubbard
 * reported 26 of 45 experts, later 26 of 46 as the panel grew. Run this after any change
 * to ballots or counting. Run: npx tsx scripts/validate-against-product.ts
 */
import { recommend } from "../src/lib/engine";
import { list } from "../src/lib/rankings";

const rb = list("RB");
const hampton = rb.find((p) => p.name === "O. Hampton")!;
const hubbard = rb.find((p) => p.name === "C. Hubbard")!;

const r = recommend([hampton, hubbard], 1, "balanced")!;
const leader = r.results[0];

console.log(`published by FantasyPros:  Hampton 26 of 46 experts (57%)`);
console.log(
  `this engine:               ${leader.player.name} ${leader.firstChoiceVotes} of ${r.panelSize} experts (${leader.firstChoiceShare}%)`,
);
const drift = Math.abs(leader.firstChoiceVotes - 26);
console.log(`\ndifference: ${drift} ballot${drift === 1 ? "" : "s"} of ${r.panelSize}`);
console.log(drift <= 2 ? "within tolerance" : "OUT OF TOLERANCE, investigate");
