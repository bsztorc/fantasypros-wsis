/**
 * Harvest 2026 Week 3 consensus rankings from FantasyPros.
 *
 * Their ranking pages embed a `ecrData` object containing, for every ranked player, the
 * consensus rank and the dispersion of expert opinion behind it: best rank, worst rank,
 * average and standard deviation. That dispersion is what the prototype needs, because
 * individual expert ballots are not published in bulk.
 *
 * Run with: node scripts/harvest-rankings.mjs
 * Writes:   src/lib/fixtures/rankings-week3.json
 *
 * Re-running overwrites the snapshot with whatever is current, so the committed file is
 * the record of what was captured and when.
 */

import { writeFile, mkdir } from "node:fs/promises";

/**
 * The nine lists the Who Should I Start? tool itself offers as filters.
 *
 * Aggregates matter as much as the positional lists: a FLEX comparison is the case the
 * lineup-aware feature exists for, and its ranks are not the same as the positional ones.
 *
 * DELIBERATELY EXCLUDED: /nfl/rankings/half-point-ppr-cheatsheets.php,
 * consensus-cheatsheet.php and half-point-ppr.php. They look like the "all positions"
 * ranking and they do carry dispersion data, but they report week 0 and type "Draft".
 * They are season-long draft rankings, not Week 3, and mixing them in would put
 * preseason opinion behind a week 3 recommendation.
 *
 * FantasyPros publishes no weekly list that ranks kickers and defences alongside
 * quarterbacks, which is why Superflex is the widest weekly aggregate available.
 */
const SOURCES = [
  { position: "QB", url: "https://www.fantasypros.com/nfl/rankings/qb.php", keep: 40 },
  { position: "RB", url: "https://www.fantasypros.com/nfl/rankings/half-point-ppr-rb.php", keep: 70 },
  { position: "WR", url: "https://www.fantasypros.com/nfl/rankings/half-point-ppr-wr.php", keep: 80 },
  { position: "TE", url: "https://www.fantasypros.com/nfl/rankings/half-point-ppr-te.php", keep: 40 },
  { position: "FLEX", url: "https://www.fantasypros.com/nfl/rankings/half-point-ppr-flex.php", keep: 150 },
  { position: "SUPERFLEX", url: "https://www.fantasypros.com/nfl/rankings/half-point-ppr-superflex.php", keep: 180 },
  { position: "K", url: "https://www.fantasypros.com/nfl/rankings/k.php", keep: 33 },
  { position: "DST", url: "https://www.fantasypros.com/nfl/rankings/dst.php", keep: 32 },
  { position: "IDP", url: "https://www.fantasypros.com/nfl/rankings/idp.php", keep: 100 },
];

/** Pull the ecrData object out of the page by matching braces from its opening one. */
function extractEcrData(html) {
  const marker = "var ecrData = ";
  const start = html.indexOf(marker);
  if (start === -1) throw new Error("ecrData not found");

  let index = start + marker.length;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (; index < html.length; index += 1) {
    const char = html[index];
    if (escaped) { escaped = false; continue; }
    if (char === "\\") { escaped = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(html.slice(start + marker.length, index + 1));
      }
    }
  }
  throw new Error("unterminated ecrData object");
}

const number = (value) => (value === null || value === "" ? null : Number(value));

async function harvest({ position, url, keep }) {
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`${position}: HTTP ${response.status}`);

  const data = extractEcrData(await response.text());
  const players = data.players.slice(0, keep).map((player) => ({
    id: String(player.player_id),
    name: player.player_short_name,
    fullName: player.player_name,
    position: player.player_position_id,
    team: player.player_team_id,
    opponent: player.player_opponent,
    posRank: player.pos_rank,
    ecr: number(player.rank_ecr),
    best: number(player.rank_min),
    worst: number(player.rank_max),
    average: number(player.rank_ave),
    deviation: number(player.rank_std),
    grade: player.start_sit_grade,
    projectedPoints: number(player.r2p_pts),
    owned: number(player.owned_perc),
  }));

  return { position, week: data.week, year: data.year, scoring: data.scoring, count: players.length, players };
}

const results = [];
for (const source of SOURCES) {
  try {
    const result = await harvest(source);
    results.push(result);
    console.log(`${source.position.padEnd(4)} ${result.count} players, week ${result.week} ${result.year} (${result.scoring})`);
  } catch (error) {
    console.error(`${source.position.padEnd(4)} FAILED: ${error.message}`);
  }
}

const weeks = new Set(results.map((r) => `${r.year}-W${r.week}`));
// Guards against a draft-season list being mistaken for a weekly one.
if (weeks.size !== 1) {
  console.error(`\nREFUSING TO WRITE: sources disagree on week: ${[...weeks].join(", ")}`);
  process.exit(1);
}

await mkdir("src/lib/fixtures", { recursive: true });
await writeFile(
  "src/lib/fixtures/rankings-week3.json",
  JSON.stringify(
    {
      source: "FantasyPros consensus rankings",
      capturedAt: new Date().toISOString(),
      season: results[0].year,
      week: results[0].week,
      scoring: results[0].scoring,
      urls: SOURCES.map((s) => s.url),
      positions: Object.fromEntries(results.map((r) => [r.position, r.players])),
    },
    null,
    2,
  ) + "\n",
);

console.log(`\nWrote src/lib/fixtures/rankings-week3.json (${[...weeks][0]}, ${results.reduce((n, r) => n + r.count, 0)} players)`);
