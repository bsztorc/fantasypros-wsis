# Handoff

Where the prototype stands, what was decided, and what is deliberately absent. Written
2026-09-26, last updated 2026-09-27, for whoever picks this up next, including a fresh
session with no memory of how it got here.

**Assignment due Wednesday 2026-09-30. Brandon plans to send it Tuesday.**

**Next up: the improvements list and the dev spec.** The landing page is built and is now
the site's root; "The landing page, as built" below records what it says and what was left
off it. The rest of this document is background you will want if a question comes up.

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

## The landing page, as built

**Built and released.** The site's root is the landing page: `src/app/page.tsx` renders
`src/components/landing/landing-page.tsx`, and the tool moved to `/wsis`. The deliverable is
a single shared link, so whoever opens it meets the feature before the tool, and the banner
itself links to `/wsis` so the working tool stays one click away above the fold.

The copy is Brandon's, finalised in `assets/WSIS Landing Page - User Facing v2.docx`, which is
untracked like the rest of `assets/`. The three images are committed to `public/`.

### Who it is for

A fantasy manager, and only a fantasy manager.

An earlier version of this section argued the page had two readers, the manager nominally and
the panel in practice, and that research evidence belonged on it to prove rigour to the panel.
**That was wrong, and the shipped page does not work that way.** A statistic about how many
other people ask a two-slot question tells a reader nothing they can act on, because they
already know whether they have two spots to fill. Prevalence evidence justifies funding a
build. It does not sell a feature. The argument it was carrying belongs in the improvements
proposal, where the reader has asked why this is worth building.

### What is on the page

- The two features in the user's words, each with a scenario, a mechanism and a screenshot.
- Two screenshots, both at Start N of 2, one Balanced and one Most Upside. The change between
  them is the new feature responding to a control the user moved, which is a launch page
  demonstrating its own capability rather than critiquing the old one.
- One credibility line: the same Expert Consensus Rankings, no re-ranking.

### What was deliberately left off, and why

- **The 27%, the 31% and the divergence range.** See "Who it is for". All three move to the
  improvements proposal.
- **Every comparison of old behaviour to new.** The one-slot screenshot came off for this
  reason. With it on the page a reader saw a player at 2% become a recommendation, with no
  way to read that except as the tool contradicting itself. Nothing on the page now shows or
  implies a prior answer. A real launch does not publish a critique of its own prior output.
- **Player names in the copy.** The screenshots carry the specifics, and keeping names out of
  the prose means the page does not date itself to the Week 3 snapshot.
- Methodology of any kind, the assignment, and the word "prototype".

### Tone check

The page never tells the user their old way was stupid. The existing percentage is correct and
useful at one slot. The pitch is that the tool now answers a second question, not that it was
broken. The last old-versus-new phrasing on the page, "not just the leader", became "not just
the top player" for the same reason, and because "leader" was the engine's vocabulary rather
than a reader's.

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
npm run check:snapshot    # the frozen data is still the frozen data
npm run check:engine      # 2754 comparisons, plus 4176 selection-order permutations
npm run check:divergence  # divergence rate by roster tier
```

`npm run build` runs the first two and fails on either, so neither a moved snapshot nor an
order-dependent result can reach production. Run the third after any engine change. The invariant sweep exists because four bugs were
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
- **The answer depends on the set of players, never the order they were selected in.**
  Non-negotiable, and gated by `npm run build`.

  The engine failed this in production. The panel seed was built from the players in the
  order given, so the same three receivers returned six different answers depending on which
  name was clicked first. Wilson led at 67% one way round, Bateman led at 59% another, with
  the data untouched. It surfaced when a walkthrough written against one ordering was
  replayed against another, which is the same way it would have surfaced in front of a panel.

  `buildPanel` now sorts into a canonical order first, by name and then by id, and every
  tie-break in the engine ends on that same comparison so display order cannot drift either.
  By name rather than by rank on purpose: ranks move if the snapshot is ever re-frozen, and
  a canonical order derived from the data would silently reshuffle every panel when it did.

  `scripts/check-engine.ts` permutes the input on 150 comparisons across every goal and slot
  count, 4176 permutations, and exits non-zero on any disagreement. The check that used to
  sit there called `recommend` twice with the same array, which is why it never caught this.
  Calling a pure function twice the same way proves nothing.
- **Do not gate Start N.** The case rests on gating personalization and never the answer.
  Gating the core feature contradicts it.
- **Sync conversion is demonstrated, not built.** The demo-state switcher is the argument:
  two locked slots become four, no roster becomes a roster, one goal becomes three.
- **Hero copy stays inside the artwork. Rendering it live was tried and reverted.**

  The banner is a screenshot crop of FantasyPros' Research pillar and cannot be re-exported
  larger, so the page upscales it and the baked text softens. Live text stays crisp, which
  made a single live line read as darker than its neighbours even though the colours were
  identical: sampled from the artwork, the headline and the label are both #16191d, the
  value the live text used, and the tagline was pure black.

  Every run was taken out and rendered live instead, positioned in percentages and sized in
  `cqw`, landing within two pixels of the ink it replaced. It measured right and still looked
  wrong, because the eye was reading rasterisation rather than geometry. One uniformly
  softened image beats a mix of soft artwork and crisp live text.

  The cost is the hover underline on "Try it now", which the live version had. Worth another
  look only if a higher-resolution source for that banner ever turns up.

---

## Where the deliverables stand

| Deliverable | State |
|---|---|
| Prototype | Done, released to `main` |
| Improvements proposed, each with problem, benefit, measure | Not started |
| One prioritized, with reasoning | Not started |
| Landing page explaining the value to a user | Done, at the site root |
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
