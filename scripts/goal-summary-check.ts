/** Summary text across goals for a case the goal changes. Run: npx tsx scripts/goal-summary-check.ts */
import { recommend } from "../src/lib/engine";
import { MY_ROSTER } from "../src/lib/fixtures/roster";
import { upsideRoom, bustRoom } from "../src/lib/ballots";

const find = (n: string) => MY_ROSTER.find((p) => p.name === n)!;
const trio = [find("S. Barkley"), find("A. Mitchell"), find("R. Bateman")];

console.log("spread behind each player");
for (const p of trio) {
  console.log(`  ${p.name.padEnd(14)} ${p.posRank.padEnd(6)} best ${String(p.best).padStart(3)} avg ${String(p.average).padStart(6)} worst ${String(p.worst).padStart(3)}  ceiling ${upsideRoom(p).toFixed(1)}  downside ${bustRoom(p).toFixed(1)}`);
}

for (const goal of ["balanced", "most-upside", "safe-floor"] as const) {
  const r = recommend(trio, 2, goal)!;
  const picks = r.results.filter((x) => x.recommended).map((x) => x.player.name).join(" + ");
  console.log(`\n${goal}: ${picks}${r.goalChangedFrom ? "  (changed)" : ""}`);
  console.log(`  ${r.results.map((x) => `${x.player.name} ${x.firstChoiceShare}%/${x.inclusionShare}%`).join("  ")}`);
}
