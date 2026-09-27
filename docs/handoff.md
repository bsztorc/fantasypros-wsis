# Handoff

Where the prototype stands, what was decided, and what is deliberately absent. Written
2026-09-26, last updated 2026-09-27, for whoever picks this up next, including a fresh
session with no memory of how it got here.

**Assignment due Wednesday 2026-09-30. Brandon plans to send it Tuesday.**

**Next up: the landing page.** Read "The story, locked" and "Next: the landing page" below
before writing a word of it. The rest of this document is background you will want if a
question comes up, not required reading for that task.

---

## The prototype is finished and released

It does what it was built to do: demonstrate that the question a fantasy manager arrives
with is not the question Who Should I Start? answers, and show what changes when it is.

Live at the production URL. `main` and `develop` are level, history is linear, no open
branches. Real 2026 Week 3 data throughout.

### What it has

| Feature | Notes |
|---|---|
| **Start N of Y** | The core change. Recommends the combination rather than a winner. |
| **Lineup Goal** | Safe Floor / Balanced / Most Upside, ordered as a risk scale. Premium gates the outer two. |
| **Injury visibility** | Real designations beside every player name, on every screen. |
| **Three demo states** | Signed Out, Signed In unsynced, Premium synced, switched from the header. |
| **Advice view** | Two to four players, tabs consolidated from eleven to five. |
| **Results band** | At one slot it matches the product exactly: leader ring, first-choice badges on the rest. Above one slot the recommended players join one tile under one percentage, and the individual badges go. |
| **Coach AI summary** | Templated, always rendered, including at three or more players where the product drops it. Two paragraphs at most: the recommendation, then what the lineup goal contributes when one is set. Nothing else. |

### The argument it makes

The existing percentage is the share of experts who made a player their **single first
choice**. It looks like a ranking and is read as one. At one slot that is fine. Above one
slot it answers a question nobody asked.

The strongest single demonstration: select three players where one dominates. The other
two both render **0%**. The tool cannot distinguish the two players the user is actually
choosing between. Raise Players to Start and they separate.

**The existing percentage is this measure with N fixed at one.** The feature does not add a
statistic, it exposes a parameter. That framing matters: nothing about FantasyPros' math is
being challenged.

---

## The story, locked

**One idea: turn Who Should I Start? from a player comparison into a flexible decision
tool.** Two features carry it, and each one answers something Brandon found in his own
sample of 100 start/sit requests.

| Feature | The finding behind it |
|---|---|
| **Start N of Y** | 27% of requests were filling more than one slot. The tool only ever computes each expert's first choice. |
| **Lineup Goal** | 31% volunteered context beyond scoring and roster format, dominated by injury worry and whether they needed a floor or a ceiling. The tool has no way to hear any of it. |

Two findings, two features, one idea. That is the whole pitch and it should stay that tight.

**Do not add 27% and 31%.** They are overlapping sets. "58% unserved" is wrong and will be
caught.

**A third feature was built and cut.** Team-aware injury reasoning worked and was removed on
purpose, because it changed what the tool *said* rather than what it *computed*, and the
product's own AI summary could already say it. The full reasoning is under "Decisions worth
not relitigating". It is now the strongest item on the proposed-improvements list. If anyone
asks why the injury research did not become a feature, that is the answer, and it is a
better answer than having built it.

**The line worth having ready:** Start N and Lineup Goal run entirely on data already on
that page. Anything roster-aware needs data the tool does not touch.

---

## Next: the landing page

The assignment asks for a landing page explaining the feature and its value **to a user,
not to a product team**. That constraint is the whole job, and it is the easiest one to
fail, because everything else in this repo is written for a product team.

**Write for a fantasy manager.** Someone who opens the tool on a Sunday morning with two
flex spots and three names. Not a PM, not JMO, not an interviewer.

**Belongs on the page:**

- The moment of the problem: you have two spots and three players, and the tool only tells
  you who is best, once.
- What Start N does, in their words: tell it how many spots you are filling and it picks the
  combination, not just a winner.
- What Lineup Goal does: some weeks you need a safe floor, some weeks you need a ceiling.
  Say which and the recommendation changes.
- Plain screenshots of the real thing.

**Does not belong on the page:**

- Divergence rates, medians, ranges, tiers. None of it. Those are arguments for a product
  team about whether to build this, and the user does not care whether it is 13% or 30%.
- Expert panels, reconstruction, dispersion, sample sizes.
- The research percentages. "27% of users" is a reason to build it, not a reason to use it.
- Any mention of the assignment, the interview, or FantasyPros' shortcomings as a company.
  The page should read like something FantasyPros would ship, not a critique of them.
- The word "prototype" anywhere in the user-facing copy.

**Tone check:** the page never tells the user their old way was stupid. The existing
percentage is correct and useful at one slot. The pitch is that the tool now answers a
second question it could not answer before, not that it was broken.

**Assets Brandon is already drafting** live in `assets/` and are not tracked by git:
`WSIS Landing Page.docx` and `WSIS Hero Image.png`. Ask him where he wants the final page to
live before building anything: it may be a document rather than a route in this app. Do not
assume it belongs in `src/`.

---

## Data

The data is frozen, and that is the feature. Rankings move through a week and again between
weeks, so a walkthrough given today and the same walkthrough given a month from now have to
reach the same recommendation. By demo day the live site is on Week 4, so matching it is
impossible and a fixed snapshot is the only correct choice.

- `src/lib/fixtures/rankings-week3.json` — 765 entries across the nine lists the tool
  itself offers as filters, 435 distinct players, captured 2026-09-26. Harvested with
  `scripts/harvest-rankings.mjs`, which refuses to write when its sources disagree on the
  week.
- `src/lib/fixtures/injuries-week3.json` — 11 designations, hand-assembled. FantasyPros
  blocks bulk collection with 403 after roughly two hundred player-page requests.
  `scripts/harvest-injuries.mjs` refuses to write when it finds fewer than the file holds,
  because a blocked run returns nothing and would erase good data. It did once.
- `src/lib/fixtures/snapshot.lock.json` — the hash of each fixture. `npm run build` verifies
  them and fails if either has moved.

**Neither harvest script will overwrite a snapshot that already exists.** The snapshot was
overwritten once by an unattended re-harvest, which moved every measured number in the
write-up and was noticed only afterwards. Both scripts now require `--force`, and the build
checks the hashes. Re-freezing is therefore deliberate, and everything the write-up quotes
has to be re-measured after it:

```
node scripts/harvest-rankings.mjs --force
node scripts/check-snapshot.mjs --write
```

Individual expert rankings are not published, so the engine reconstructs a panel of them from
the published dispersion: best rank, worst rank, average and standard deviation per player.
What it reproduces is how much the experts disagree, not who said what. It was checked once
against a published head-to-head to confirm the snapshot behaves like the real product, which
was the whole purpose of that check. It is not a gate, and nobody is going to compare the
prototype's numbers to the live site.

**In the write-up, describe the data as a reconstructed snapshot of FantasyPros' published
rankings at a moment in time.** No precision claim, and no expert counts offered as proof.

---

## Verification

```
npm run check:snapshot    # the frozen data is still the frozen data; also runs in the build
npm run check:engine      # invariants across 2754 comparisons
npm run check:divergence  # divergence rate by roster tier
```

Run the last two after any engine change. The invariant sweep exists because four bugs were
found by inspection rather than by tests, three of them by Brandon reading output and asking
whether a number made sense.

`scripts/validate-against-product.ts` is the record of the one-time calibration against the
live product, kept for the history. It prints the captured number beside what this snapshot
produces. There is no verdict and nothing to pass: the two are different moments, and the two
players involved sit 0.19 of a rank apart, which is closer than the reconstruction can
separate.

---

## Decisions worth not relitigating

- **Consensus strength: not built.** Its thresholds would be invented, and it interprets
  two numbers already on screen. Goes in the write-up, where the real insight lives: a
  small panel caps how strong a consensus can honestly be called, so 100% of 12 experts is
  weaker than 70% of 46.
- **Team-aware reasoning: not built. Built once, then cut, and the cut is the decision that
  stands.** Do not put it back without reading this.

  It was built on 2026-09-26 as a synced-only paragraph in the summary: a designation that
  will not resolve until after the rest of the user's week has finished, and what their own
  bench could do about it. It worked, and it was cut on 2026-09-27 for two reasons that have
  nothing to do with whether it worked.

  **It changes what the tool says, not what the tool computes.** The roster, the designation
  and the kickoff time all already exist, and the product's own AI summary can reach them. A
  reviewer can say "Coach AI could do that with a prompt change" and be right. Start N does
  not have that problem: it counts how often a player appears in an expert's top N, and that
  number is not calculated anywhere in the product today, so no summary can narrate it.

  **It cost more spec than the feature being pitched.** Nineteen branches, and three data
  sources the tool does not otherwise touch: roster state, injury feed, kickoff schedule.
  Start N and Lineup Goal both run entirely on the rankings and dispersion already on the
  page. That line is worth stating out loud in the write-up.

  It belongs on the proposed-improvements list instead, where it is the strongest candidate:
  injury uncertainty was the dominant theme in the extra context users volunteered. Proposing
  it and not building it is the prioritization the assignment asks for.

  **Injury designations beside player names stay.** That is a different thing: it makes
  injuries visible, it costs nothing, and it fixes a real defect in the live product.
- **Inferred lineup goal and matchup-margin reasoning: not built.** Both need league and
  matchup state that does not exist, and inventing it would put fabricated data behind a
  recommendation. Everything else invented in the prototype is inert dressing. Write-up.
- **Do not gate Start N.** The case rests on gating personalization and never the answer.
  Gating the core feature contradicts it.
- **Sync conversion is demonstrated, not built.** The demo-state switcher is the argument:
  two locked slots become four, no roster becomes a roster, one goal becomes three.

---

## Where the deliverables stand

| Deliverable | State |
|---|---|
| Prototype | Done, released to `main` |
| Improvements proposed, each with problem, benefit, measure | Not started |
| One prioritized, with reasoning | Not started |
| Landing page explaining the value to a user | **Next** |
| Dev spec, written for a developer or coding agent | Not started |

Team-aware injury reasoning is the first entry for the proposed-improvements list: it has
research behind it, a clear user benefit, a measure, and a written reason for not being the
one prioritized. Most of that write-up already exists under "Decisions worth not
relitigating".

**The dev spec is the one JMO reads closely.** He is a career developer with published
Django libraries. Less prose, explicit structure, testable criteria, named edge cases.

---

## Material for the write-up

`docs/metrics.md` holds every number with its source and what it does not say. Three
things are worth building an argument on:

1. **Divergence concentrates where decisions are hard.** Medians across twenty-four
   reconstructions: QB1 0.9%, RB1 2.5%, TE1 1.8%, against 21.6% for the flex tier managers
   agonise over. The display works where it does not matter and fails where it does.
   **Quote ranges, never a single figure:** flex runs 13.7% to 30.5% depending on how the
   panel is reconstructed, and an earlier draft's 22.3% was a property of the seed. What holds
   in every run is the ordering, not the level. Do not claim a smooth gradient either;
   adjacent tiers overlap and some invert.
2. **A real comparison where the headline contradicts its own evidence.** Hampton leads the
   vote at 43% while Hubbard leads every accuracy-filtered expert subset (58 / 54 / 40),
   both sentiment meters, and season production. Hampton wins on exactly two rows,
   projection and matchup rating. The page does not say so, and at three players the
   summary that would have said so disappears.
3. **Their own support library documents cross-tool disagreement.** Do not present it as a
   discovery. The stronger line: a product that needs a support library to explain why its
   own recommendations disagree is not explaining itself.

Traps recorded in `docs/metrics.md`: the 27% and 31% are overlapping sets and must not be
added. `docs/parking-lot.md` holds ideas deliberately set aside, including Recommended
Searches and the combination logic for correlated players.

---

## Working agreement

Feature branch, pull request, squash merge to `develop`, then a release from `develop` to
`main`. No exceptions, including small fixes and including work immediately after a
release. `main` fast-forwards from `develop` so history stays linear.

Answer the question asked, then stop. A question about what something would take is not
authorization to build it.

The repo is part of the deliverable. JMO is a career developer with published Django
libraries and may read it rather than only the deployed prototype. Treat commit history,
README accuracy and the absence of scaffold leftovers as work, and raise hygiene problems
without being asked.

**Untracked and deliberately so:** `assets/` holds Brandon's in-progress Word files,
including Word lock files (`~$…`, `~WRL….tmp`) that must never be committed. A
`git add -A` would take them. There is no `.gitignore` rule for them yet; Brandon has been
asked and has not decided.

**Style, for anything written for the assignment:** no em dashes or double hyphens, and
never the words "actually" or "absolutely".
