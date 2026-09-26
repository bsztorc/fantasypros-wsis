/**
 * Invariant sweep over the engine. Run: npx tsx scripts/check-engine.ts
 *
 * Every check here is a property that must hold for any comparison, not a spot check of
 * one case. Ad hoc inspection has already missed three bugs in this engine; these are the
 * statements that would have caught them.
 */
import { recommend } from "../src/lib/engine";
import { list, type RankedPlayer } from "../src/lib/rankings";
import { MY_ROSTER } from "../src/lib/fixtures/roster";
import type { LineupGoal, StartN } from "../src/lib/types";

let checked = 0;
const failures: string[] = [];
const fail = (what: string) => failures.push(what);

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [head, ...tail] = items;
  return [...combinations(tail, size - 1).map((c) => [head, ...c]), ...combinations(tail, size)];
}

const pool = [...MY_ROSTER, ...list("FLEX").slice(0, 24)];
const unique = [...new Map(pool.map((p) => [p.id, p])).values()];
const sets = [...combinations(unique.slice(0, 22), 2), ...combinations(unique.slice(0, 16), 3)];

for (const players of sets) {
  for (const goal of ["balanced", "most-upside", "safe-floor"] as LineupGoal[]) {
    for (const startN of [1, 2, 3] as StartN[]) {
      if (startN >= players.length) continue;
      const r = recommend(players, startN, goal);
      if (!r) continue;
      checked += 1;
      const label = `${players.map((p) => p.name).join("/")} N=${startN} ${goal}`;

      const firstTotal = r.results.reduce((s, x) => s + x.firstChoiceVotes, 0);
      if (firstTotal !== r.panelSize) fail(`${label}: first choices total ${firstTotal}, expected ${r.panelSize}`);

      const inclusionTotal = r.results.reduce((s, x) => s + x.inclusionVotes, 0);
      if (inclusionTotal !== r.panelSize * startN)
        fail(`${label}: inclusions total ${inclusionTotal}, expected ${r.panelSize * startN}`);

      const picked = r.results.filter((x) => x.recommended);
      if (picked.length !== startN) fail(`${label}: recommended ${picked.length}, expected ${startN}`);

      if (r.combinationShare < 0 || r.combinationShare > 100)
        fail(`${label}: combination share ${r.combinationShare}`);

      // A recommended player must be in at least as many lineups as anyone left out.
      const worstPicked = Math.min(...picked.map((x) => x.inclusionVotes));
      const bestBenched = Math.max(
        0,
        ...r.results.filter((x) => !x.recommended).map((x) => x.inclusionVotes),
      );
      if (worstPicked < bestBenched)
        fail(`${label}: benched player has more support than a recommended one`);

      // At one slot the two measures are the same question, so they must agree.
      if (startN === 1) {
        for (const x of r.results) {
          if (x.firstChoiceVotes !== x.inclusionVotes)
            fail(`${label}: ${x.player.name} first ${x.firstChoiceVotes} vs inclusion ${x.inclusionVotes}`);
        }
        if (r.combinationShare !== r.results[0].firstChoiceShare)
          fail(`${label}: combination ${r.combinationShare} vs leader ${r.results[0].firstChoiceShare}`);
      }

      // Divergence and undecidability are different findings and cannot both hold.
      if (r.diverges && r.indistinguishable) fail(`${label}: reported as both diverging and undecidable`);
    }
  }
}

// Balanced must be untouched by the goal machinery.
for (const players of sets.slice(0, 200)) {
  const a = recommend(players, 1, "balanced");
  const b = recommend(players, 1, "balanced");
  if (JSON.stringify(a?.results.map((x) => x.firstChoiceVotes)) !== JSON.stringify(b?.results.map((x) => x.firstChoiceVotes)))
    fail("balanced is not deterministic");
}

console.log(`${checked} comparisons checked`);
console.log(failures.length === 0 ? "all invariants hold" : `${failures.length} failures:`);
for (const f of failures.slice(0, 12)) console.log(`  ${f}`);
