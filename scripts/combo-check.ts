/** What share of experts would start exactly this set? Run: npx tsx scripts/combo-check.ts */
import { buildPanel } from "../src/lib/ballots";
import { recommend } from "../src/lib/engine";
import { list, type RankedPlayer } from "../src/lib/rankings";

const wr = list("WR");
const find = (n: string) => wr.find((p) => p.name === n)!;

/** Share of ballots whose top N is exactly this set of players. */
function combinationSupport(players: RankedPlayer[], set: RankedPlayer[]): number {
  const panel = buildPanel(players);
  const wanted = new Set(set.map((p) => p.id));
  let agree = 0;
  for (const ballot of panel) {
    const top = [...players]
      .sort((a, b) => (ballot.get(a.id) ?? 0) - (ballot.get(b.id) ?? 0))
      .slice(0, set.length)
      .map((p) => p.id);
    if (top.length === wanted.size && top.every((id) => wanted.has(id))) agree += 1;
  }
  return Math.round((agree / panel.length) * 100);
}

/** Every possible set, so we can see whether the winner is a clear one. */
function allSets(players: RankedPlayer[], n: number): RankedPlayer[][] {
  if (n === 0) return [[]];
  if (players.length < n) return [];
  const [head, ...tail] = players;
  return [...allSets(tail, n - 1).map((s) => [head, ...s]), ...allSets(tail, n)];
}

const trio = [find("A. Mitchell"), find("M. Wilson"), find("R. Bateman")];

for (const startN of [1, 2] as const) {
  const r = recommend(trio, startN, "balanced")!;
  const picked = r.results.filter((x) => x.recommended).map((x) => x.player);
  console.log(`\nStart ${startN}: engine picks ${picked.map((p) => p.name).join(" + ")}`);
  console.log(`  individual shares: ${r.results.map((x) => `${x.player.name} ${x.inclusionShare}%`).join(", ")}`);
  console.log(`  every possible set:`);
  for (const set of allSets(trio, startN)) {
    const support = combinationSupport(trio, set);
    const isPick = set.every((p) => picked.some((q) => q.id === p.id)) && set.length === picked.length;
    console.log(`    ${set.map((p) => p.name).join(" + ").padEnd(30)} ${String(support).padStart(3)}%${isPick ? "   <-- recommended" : ""}`);
  }
}
