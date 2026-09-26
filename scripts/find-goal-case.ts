/** Find comparisons where the lineup goal changes the answer. Run: npx tsx scripts/find-goal-case.ts */
import { recommend } from "../src/lib/engine";
import { list, type RankedPlayer } from "../src/lib/rankings";
import { MY_ROSTER } from "../src/lib/fixtures/roster";

const posNum = (p: RankedPlayer) => Number(String(p.posRank).replace(/\D/g, ""));
const flexOne = list("FLEX").filter((p) => {
  const r = posNum(p);
  if (p.position === "RB") return r >= 25 && r <= 36;
  if (p.position === "WR") return r >= 25 && r <= 48;
  return false;
});

function scan(pool: RankedPlayer[], label: string, limit: number) {
  const hits: string[] = [];
  for (let i = 0; i < pool.length && hits.length < limit; i++)
    for (let j = i + 1; j < pool.length && hits.length < limit; j++)
      for (let k = j + 1; k < pool.length && hits.length < limit; k++) {
        const trio = [pool[i], pool[j], pool[k]];
        const base = recommend(trio, 2, "balanced");
        if (!base) continue;
        for (const goal of ["most-upside", "safe-floor"] as const) {
          const r = recommend(trio, 2, goal);
          if (r?.goalChangedFrom) {
            const from = r.goalChangedFrom.map((p) => p.name).join(" + ");
            const to = r.results.filter((x) => x.recommended).map((x) => x.player.name).join(" + ");
            hits.push(`${goal.padEnd(12)} ${trio.map((p) => p.name).join(" / ").padEnd(42)} ${from}  ->  ${to}`);
          }
        }
      }
  console.log(`\n${label}: ${hits.length ? "" : "none found"}`);
  for (const h of hits) console.log(`  ${h}`);
}

scan(MY_ROSTER.filter((p) => ["RB", "WR", "TE"].includes(p.position)), "Within the demo roster", 8);
scan(flexOne.slice(0, 26), "Across the flex tier", 8);
