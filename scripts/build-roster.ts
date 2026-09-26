/** Print the roster fixture ids. Run: npx tsx scripts/build-roster.ts */
import { ALL_PLAYERS } from "../src/lib/rankings";

const wanted: [string, string][] = [
  ["J. Burrow", "QB"],
  ["J. Gibbs", "RB"],
  ["S. Barkley", "RB"],
  ["J. Love", "RB"],
  ["A. Kamara", "RB"],
  ["D. London", "WR"],
  ["A. Mitchell", "WR"],
  ["M. Wilson", "WR"],
  ["R. Bateman", "WR"],
  ["KC Concepcion Jr.", "WR"],
  ["T. Tucker", "WR"],
  ["B. Thomas Jr.", "WR"],
  ["M. Pittman Jr.", "WR"],
  ["T. Warren", "TE"],
  ["SEA DST", "DST"],
  ["C. McLaughlin", "K"],
];

console.log("const ROSTER_IDS = [");
for (const [name, pos] of wanted) {
  const p = ALL_PLAYERS.find((x) => x.name === name && x.position === pos);
  if (!p) { console.log(`  // MISSING ${name}`); continue; }
  console.log(`  "${p.id}", // ${p.posRank.padEnd(7)} ${p.name.padEnd(18)} ${p.position} - ${p.team}`);
}
console.log("];");
