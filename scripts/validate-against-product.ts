/**
 * The one-time calibration check against the live product, kept as a record.
 *
 * FantasyPros' comparison page for Hampton against Hubbard reported 26 of 45 experts, later
 * 26 of 46 as the panel grew. That was the only external number available to check the
 * reconstruction against. It was checked once, to confirm the snapshot behaves like the real
 * product, and that was all it was ever for.
 *
 * This is not a gate and there is no tolerance to pass. On the frozen snapshot these two
 * players sit 0.19 of a rank apart, with Hubbard the more widely dispersed of the pair, so
 * which of them leads is inside the reconstruction margin and an ordinary intra-week ranking
 * update moves it. The prototype exists to demonstrate a feature, not to reproduce
 * FantasyPros' output.
 *
 * Run: npx tsx scripts/validate-against-product.ts
 */
import { recommend } from "../src/lib/engine";
import { list } from "../src/lib/rankings";

const rb = list("RB");
const hampton = rb.find((p) => p.name === "O. Hampton")!;
const hubbard = rb.find((p) => p.name === "C. Hubbard")!;

const r = recommend([hampton, hubbard], 1, "balanced")!;
const leader = r.results[0];

console.log(`captured from the product:  Hampton 26 of 46 experts (57%)`);
console.log(
  `this snapshot:              ${leader.player.name} ${leader.firstChoiceVotes} of ${r.panelSize} experts (${leader.firstChoiceShare}%)`,
);
console.log(
  `\nHampton  average rank ${hampton.average}, best ${hampton.best}, worst ${hampton.worst}, sd ${hampton.deviation}`,
);
console.log(
  `Hubbard  average rank ${hubbard.average}, best ${hubbard.best}, worst ${hubbard.worst}, sd ${hubbard.deviation}`,
);
console.log(
  `\nA record, not a threshold. The captured number and this snapshot are different moments,` +
    `\nand these two players are too close for the reconstruction to separate reliably.`,
);
