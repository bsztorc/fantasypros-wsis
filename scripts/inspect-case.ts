/** Full numbers behind the demo comparison. Run: npx tsx scripts/inspect-case.ts */
import { recommend } from "../src/lib/engine";
import { list, type RankedPlayer } from "../src/lib/rankings";

const wr = list("WR");
const find = (name: string) => wr.find((p) => p.name === name)!;
const trio = [find("A. Mitchell"), find("M. Wilson"), find("R. Bateman")];

console.log("Underlying published data (WR list, Week 3)\n");
console.log(`  ${"Player".padEnd(14)}${"rank".padStart(6)}${"best".padStart(6)}${"worst".padStart(7)}${"avg".padStart(8)}${"sd".padStart(7)}   ${"matchup"}`);
for (const p of trio as RankedPlayer[]) {
  console.log(
    `  ${p.name.padEnd(14)}${p.posRank.padStart(6)}${String(p.best).padStart(6)}${String(p.worst).padStart(7)}` +
      `${String(p.average).padStart(8)}${String(p.deviation).padStart(7)}   ${p.team} ${p.opponent ?? ""}`,
  );
}

for (const startN of [1, 2] as const) {
  const r = recommend(trio, startN, "balanced")!;
  console.log(`\nStart ${startN} of 3   panel of ${r.panelSize}   diverges=${r.diverges}  undecidable=${r.indistinguishable}`);
  console.log(`  ${"Player".padEnd(14)}${"first choice".padStart(15)}${"would start".padStart(15)}   pick`);
  for (const x of r.results) {
    console.log(
      `  ${x.player.name.padEnd(14)}${(x.firstChoiceShare + "% (" + x.firstChoiceVotes + ")").padStart(15)}` +
        `${(x.inclusionShare + "% (" + x.inclusionVotes + ")").padStart(15)}   ${x.recommended ? "<-- START" : ""}`,
    );
  }
}

for (const goal of ["balanced", "most-upside", "safe-floor"] as const) {
  const r = recommend(trio, 2, goal)!;
  console.log(`  goal ${goal.padEnd(12)} -> ${r.results.filter((x) => x.recommended).map((x) => x.player.name).join(" + ")}`);
}
