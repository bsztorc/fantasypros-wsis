/**
 * Invariant sweep over the engine. Run: npx tsx scripts/check-engine.ts
 *
 * Every check here is a property that must hold for any comparison, not a spot check of
 * one case. Ad hoc inspection has already missed three bugs in this engine; these are the
 * statements that would have caught them.
 */
import { recommend } from "../src/lib/engine";
import { list } from "../src/lib/rankings";
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

/**
 * The answer depends on the set of players, never on the order they were chosen in.
 *
 * This check exists because the engine failed it in production. The panel seed was built
 * from the players in the order given, and each player drew from the sequence at the
 * position it sat in, so the same three receivers returned six different answers depending
 * on which name was clicked first: Wilson led at 67% one way round, Bateman led at 59%
 * another. It surfaced only when a walkthrough written against one ordering was replayed
 * against another.
 *
 * The check that used to sit here called `recommend` twice with the same array and compared
 * the results, which is why it never caught this. Calling a pure function twice the same way
 * proves nothing. Permuting the input is the test that means something.
 */
function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest]),
  );
}

/** Order-insensitive: the facts about each player, plus the figures for the group. */
function signature(result: NonNullable<ReturnType<typeof recommend>>): string {
  return (
    result.results
      .map((x) => `${x.player.id}:${x.firstChoiceVotes}:${x.inclusionVotes}:${x.recommended}`)
      .sort()
      .join("|") + `#${result.combinationShare}#${result.panelSize}`
  );
}

let permuted = 0;
for (const players of sets.filter((s) => s.length === 3).slice(0, 150)) {
  for (const goal of ["balanced", "most-upside", "safe-floor"] as LineupGoal[]) {
    for (const startN of [1, 2] as StartN[]) {
      const baseline = recommend(players, startN, goal);
      if (!baseline) continue;
      const want = signature(baseline);
      const shown = baseline.results.map((x) => x.player.id).join(",");
      const label = `${players.map((p) => p.name).join("/")} N=${startN} ${goal}`;

      for (const order of permutations(players)) {
        const got = recommend(order, startN, goal);
        permuted += 1;
        const how = order.map((p) => p.name).join(",");
        if (!got) fail(`${label}: no result for order ${how}`);
        else if (signature(got) !== want) fail(`${label}: result changes with order ${how}`);
        else if (got.results.map((x) => x.player.id).join(",") !== shown)
          fail(`${label}: display order changes with order ${how}`);
      }
    }
  }
}

console.log(`${checked} comparisons checked`);
console.log(`${permuted} order permutations checked`);
console.log(failures.length === 0 ? "all invariants hold" : `${failures.length} failures:`);
for (const f of failures.slice(0, 12)) console.log(`  ${f}`);
if (failures.length > 0) process.exit(1);
