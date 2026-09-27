/**
 * Harvest injury designations for the players the prototype shows.
 *
 * FantasyPros renders the designation into its ranking tables client side, and the tables
 * only load twenty rows at a time, so the rankings pages cannot supply this. Each player's
 * own page carries it server side, so this reads those.
 *
 * Scoped to the roster and the top of the flex board rather than all 435 players: those
 * are the players visible without searching, and this is a snapshot for a prototype, not a
 * feed. Players outside that set simply carry no designation.
 *
 * Run with: node scripts/harvest-injuries.mjs
 * Writes:   src/lib/fixtures/injuries-week3.json
 *
 * Frozen like the rankings, and guarded the same way. Designations change through the week,
 * so a re-harvest would move what the demo shows. Re-freezing is deliberate:
 *
 *   node scripts/harvest-injuries.mjs --force
 *   node scripts/check-snapshot.mjs --write
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const OUTPUT = "src/lib/fixtures/injuries-week3.json";

// Checked before any request goes out, so a refusal costs FantasyPros nothing.
if (existsSync(OUTPUT) && !process.argv.includes("--force")) {
  console.error(
    `REFUSING TO WRITE: ${OUTPUT} already exists and the snapshot is frozen.\n` +
      "Pass --force if you mean to re-freeze, then: node scripts/check-snapshot.mjs --write",
  );
  process.exit(1);
}

/** Page wording to the abbreviation the product shows beside a name. */
const DESIGNATIONS = [
  [/injured reserve/i, "IR"],
  [/physically unable/i, "PUP"],
  [/\bsuspended\b/i, "SUSP"],
  [/\bquestionable\b/i, "Q"],
  [/\bdoubtful\b/i, "D"],
  [/\bout\b/i, "O"],
];

const snapshot = JSON.parse(await readFile("src/lib/fixtures/rankings-week3.json", "utf8"));
// Read the roster straight from the fixture so there is one source of truth for it.
const rosterSource = await readFile("src/lib/fixtures/roster.ts", "utf8");
const roster = [...rosterSource.matchAll(/"(\d+)", \/\//g)].map((m) => m[1]);

const byId = new Map();
for (const players of Object.values(snapshot.positions)) {
  for (const p of players) if (!byId.has(p.id)) byId.set(p.id, p);
}

/**
 * Everyone a reviewer is plausibly going to compare.
 *
 * Wider than the visible lists, because search reaches the whole board and a designation
 * that appears on one screen and not another reads as a bug rather than a scope decision.
 */
const wanted = new Map(byId);
for (const id of roster) if (byId.has(id)) wanted.set(id, byId.get(id));

console.log(`checking ${wanted.size} players\n`);

const found = {};
let checked = 0;

for (const player of wanted.values()) {
  const slug = player.fullName
    .toLowerCase()
    .replace(/[.'']/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  try {
    const response = await fetch(`https://www.fantasypros.com/nfl/players/${slug}.php`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    checked += 1;
    if (!response.ok) continue;
    const html = await response.text();
    const match = html.match(/class="[^"]*injuryStatus[^"]*"[^>]*>([^<]+)</);
    if (!match) continue;
    const wording = match[1].trim();
    const hit = DESIGNATIONS.find(([pattern]) => pattern.test(wording));
    if (!hit) continue;
    found[player.id] = hit[1];
    console.log(`  ${hit[1].padEnd(5)} ${player.name.padEnd(20)} ${player.posRank.padEnd(7)} (${wording})`);
  } catch {
    // A player page that will not load simply carries no designation.
  }
}

// FantasyPros blocks bulk collection: roughly two hundred player pages in, every request
// returns 403. A run that finds nothing is that block, not a week without injuries, and
// writing it would silently erase good data.
const existing = JSON.parse(
  await readFile("src/lib/fixtures/injuries-week3.json", "utf8").catch(() => '{"designations":{}}'),
);
const had = Object.keys(existing.designations ?? {}).length;
if (Object.keys(found).length < had) {
  console.error(
    `
REFUSING TO WRITE: found ${Object.keys(found).length} designations, the existing file has ${had}.` +
      `
Likely rate limited. Collect the difference by hand rather than rerunning.`,
  );
  process.exit(1);
}

await writeFile(
  OUTPUT,
  JSON.stringify(
    {
      source: "FantasyPros player pages",
      capturedAt: new Date().toISOString(),
      season: snapshot.season,
      week: snapshot.week,
      checked: wanted.size,
      designations: found,
    },
    null,
    2,
  ) + "\n",
);

console.log(`\n${Object.keys(found).length} designations across ${checked} players checked`);
console.log("Wrote src/lib/fixtures/injuries-week3.json");
