/** Print the full numbers behind one comparison. Run: npx tsx scripts/inspect-case.ts */
import { recommend } from "../src/lib/engine";
import { list } from "../src/lib/rankings";

const find = (name: string) =>
  [...list("RB"), ...list("WR"), ...list("TE")].find((p) => p.name === name)!;

const trio = [find("J. Gibbs"), find("S. Barkley"), find("C. Lamb")];

for (const startN of [1, 2] as const) {
  const r = recommend(trio, startN, "balanced")!;
  console.log(`\nStart ${startN} of ${trio.length}   panel of ${r.panelSize} experts   diverges: ${r.diverges}`);
  console.log(`  ${"Player".padEnd(14)}${"first-choice".padStart(16)}${"would start".padStart(16)}   pick`);
  for (const x of r.results) {
    console.log(
      `  ${x.player.name.padEnd(14)}` +
        `${(x.firstChoiceShare + "% (" + x.firstChoiceVotes + ")").padStart(16)}` +
        `${(x.inclusionShare + "% (" + x.inclusionVotes + ")").padStart(16)}` +
        `   ${x.recommended ? "<-- START" : ""}`,
    );
  }
  const fcSum = r.results.reduce((s, x) => s + x.firstChoiceShare, 0);
  const incSum = r.results.reduce((s, x) => s + x.inclusionShare, 0);
  console.log(`  first-choice shares sum to ${fcSum}, inclusion shares sum to ${incSum}`);
}

for (const goal of ["most-upside", "safe-floor"] as const) {
  const r = recommend(trio, 2, goal)!;
  console.log(`\nStart 2, goal ${goal}: ${r.results.filter((x) => x.recommended).map((x) => x.player.name).join(" + ")}`);
}

const r2 = recommend(trio, 2, "balanced")!;
console.log(`\nClassification: diverges=${r2.diverges}  indistinguishable=${r2.indistinguishable}`);
