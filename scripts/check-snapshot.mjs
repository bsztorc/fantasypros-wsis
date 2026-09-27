/**
 * Is the frozen snapshot still the frozen snapshot?
 *
 * The prototype runs on a fixed capture of FantasyPros' published rankings. That is
 * deliberate: rankings move through the week and again between weeks, so a live feed would
 * mean a walkthrough given today and the same walkthrough given in a month reach different
 * recommendations. Freezing the data is what makes the demo repeatable.
 *
 * The snapshot has been overwritten by an unattended re-harvest once already, which moved
 * every measured number in the write-up without anyone noticing. This check exists so that
 * cannot happen quietly again. It runs as part of `npm run build`.
 *
 * Re-freezing is a decision, not an accident. To do it on purpose:
 *   node scripts/harvest-rankings.mjs --force
 *   node scripts/check-snapshot.mjs --write
 * and then re-measure anything the write-up quotes.
 *
 * Run: node scripts/check-snapshot.mjs
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const LOCK = "src/lib/fixtures/snapshot.lock.json";
const RANKINGS = "src/lib/fixtures/rankings-week3.json";
const INJURIES = "src/lib/fixtures/injuries-week3.json";

/**
 * Hashed with line endings normalised.
 *
 * git is configured with autocrlf, so these files are LF in the repository and CRLF in a
 * Windows working copy. Hashing the raw bytes would make the lock pass on one platform and
 * fail on the other, and this check runs in the Vercel build as well as locally.
 */
const sha256 = (text) =>
  createHash("sha256")
    .update(text.replace(/\r\n/g, "\n"))
    .digest("hex");

async function describe() {
  const rankingsText = await readFile(RANKINGS, "utf8");
  const injuriesText = await readFile(INJURIES, "utf8");
  const rankings = JSON.parse(rankingsText);
  const injuries = JSON.parse(injuriesText);

  const ids = new Set();
  let entries = 0;
  for (const list of Object.values(rankings.positions)) {
    entries += list.length;
    for (const player of list) ids.add(player.id);
  }

  return {
    season: rankings.season,
    week: rankings.week,
    files: {
      [RANKINGS]: {
        sha256: sha256(rankingsText),
        capturedAt: rankings.capturedAt,
        lists: Object.keys(rankings.positions).length,
        entries,
        distinctPlayers: ids.size,
      },
      [INJURIES]: {
        sha256: sha256(injuriesText),
        capturedAt: injuries.capturedAt,
        designations: Object.keys(injuries.designations).length,
      },
    },
  };
}

const current = await describe();

if (process.argv.includes("--write")) {
  await writeFile(
    LOCK,
    JSON.stringify(
      {
        note: "The frozen data the prototype runs on. Verified by scripts/check-snapshot.mjs during npm run build. Regenerate only when re-freezing on purpose.",
        frozenAt: new Date().toISOString(),
        ...current,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`wrote ${LOCK}`);
  for (const [path, meta] of Object.entries(current.files)) {
    console.log(`  ${path}  ${meta.sha256.slice(0, 12)}`);
  }
  process.exit(0);
}

const lock = JSON.parse(await readFile(LOCK, "utf8"));
const problems = [];

if (lock.season !== current.season || lock.week !== current.week) {
  problems.push(
    `week: locked to ${lock.season} week ${lock.week}, found ${current.season} week ${current.week}`,
  );
}

for (const [path, expected] of Object.entries(lock.files)) {
  const found = current.files[path];
  if (!found) {
    problems.push(`${path}: missing`);
    continue;
  }
  if (found.sha256 !== expected.sha256) {
    problems.push(
      `${path}: content changed\n` +
        `    locked  ${expected.sha256.slice(0, 16)}  captured ${expected.capturedAt}\n` +
        `    found   ${found.sha256.slice(0, 16)}  captured ${found.capturedAt}`,
    );
  }
}

if (problems.length > 0) {
  console.error(`\nSNAPSHOT CHANGED\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(
    `\nThe prototype's data is frozen so the demo stays repeatable, and every number in` +
      `\ndocs/metrics.md is measured from it. If this change was not intended, restore the` +
      `\nfixtures with: git checkout -- src/lib/fixtures/` +
      `\n\nIf it was intended, re-measure anything the write-up quotes and re-freeze with:` +
      `\n  node scripts/check-snapshot.mjs --write\n`,
  );
  process.exit(1);
}

console.log(`snapshot intact: ${current.season} week ${current.week}`);
for (const [path, meta] of Object.entries(current.files)) {
  console.log(`  ${path}  ${meta.sha256.slice(0, 12)}  captured ${meta.capturedAt}`);
}
