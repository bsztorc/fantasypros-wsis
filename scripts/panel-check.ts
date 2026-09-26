/** Does the panel thin the way the product's does? Run: npx tsx scripts/panel-check.ts */
import { recommend } from "../src/lib/engine";
import { list } from "../src/lib/rankings";

const rb = list("RB");
const wr = list("WR");
const te = list("TE");
const qb = list("QB");
const pick = (l: typeof rb, n: string) => l.find((p) => p.name === n)!;

const cases: [string, Parameters<typeof recommend>[0], string][] = [
  ["two running backs", [pick(rb, "O. Hampton"), pick(rb, "C. Hubbard")], "45-46 published"],
  ["three running backs", [pick(rb, "O. Hampton"), pick(rb, "C. Hubbard"), pick(rb, "J. Love")], "45 published"],
  ["three backs and a receiver", [pick(rb, "O. Hampton"), pick(rb, "C. Hubbard"), pick(rb, "J. Love"), pick(wr, "J. Downs")], "42 published"],
  ["receiver and tight end", [pick(wr, "J. Downs"), pick(te, "T. Warren")], "-"],
  ["quarterback and receiver", [pick(qb, "J. Burrow"), pick(wr, "J. Downs")], "-"],
];

for (const [label, players, published] of cases) {
  const r = recommend(players, 1, "balanced");
  console.log(`  ${label.padEnd(30)} panel ${String(r?.panelSize ?? "n/a").padStart(3)}   (${published})`);
}
