/** Comparisons where the lineup goal genuinely changes the answer. Run: npx tsx scripts/find-goal-case.ts */
import { recommend } from "../src/lib/engine";
import { MY_ROSTER } from "../src/lib/fixtures/roster";

const pool = MY_ROSTER.filter((p) => ["RB", "WR", "TE"].includes(p.position));
const hits: string[] = [];

for (let i = 0; i < pool.length; i++)
  for (let j = i + 1; j < pool.length; j++)
    for (let k = j + 1; k < pool.length; k++) {
      const trio = [pool[i], pool[j], pool[k]];
      for (const goal of ["most-upside", "safe-floor"] as const) {
        const r = recommend(trio, 2, goal);
        if (!r?.goalChangedFrom) continue;
        const from = r.goalChangedFrom.map((p) => p.name).join(" + ");
        const to = r.results.filter((x) => x.recommended).map((x) => x.player.name).join(" + ");
        hits.push(
          `${goal.padEnd(12)} ${trio.map((p) => p.name).join(" / ").padEnd(44)} ${from}  ->  ${to}`,
        );
      }
    }

console.log(`${hits.length} of the roster's three-player comparisons change with a goal\n`);
for (const h of hits.slice(0, 12)) console.log(`  ${h}`);
