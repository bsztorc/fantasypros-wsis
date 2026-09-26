# Handoff

Where the prototype stands, what was decided, and what is deliberately absent. Written
2026-09-26 for whoever picks this up next, including a fresh session with no memory of how
it got here.

**Assignment due Wednesday 2026-09-30. Brandon plans to send it Tuesday.**

---

## The prototype is finished

It does what it was built to do: demonstrate that the question a fantasy manager arrives
with is not the question Who Should I Start? answers, and show what changes when it is.

Live at the production URL, built from `main`. Real 2026 Week 3 data throughout.

### What it has

| Feature | Notes |
|---|---|
| **Start N of Y** | The core change. Recommends the combination rather than a winner. |
| **Lineup Goal** | Safe Floor / Balanced / Most Upside, ordered as a risk scale. Premium gates the outer two. |
| **Injury visibility** | Real designations beside every player name, on every screen. |
| **Three demo states** | Signed Out, Signed In unsynced, Premium synced, switched from the header. |
| **Advice view** | Two to four players, tabs consolidated from eleven to five. |
| **Coach AI summary** | Templated, always rendered, including at three or more players where the product drops it. |

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
- **Team-aware reasoning: not built.** Final rosters are announced ninety minutes before
  kickoff, which kills the reassuring half. The remaining half is premium analysis a free
  user cannot know they are missing. Write-up.
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
| Prototype | Done |
| Improvements proposed, each with problem, benefit, measure | Not started |
| One prioritized, with reasoning | Not started |
| Landing page explaining the value to a user | Not started |
| Dev spec, written for a developer or coding agent | Not started |

**The dev spec is the one JMO reads closely.** He is a career developer with published
Django libraries. Less prose, explicit structure, testable criteria, named edge cases.

---

## Material for the write-up

`docs/metrics.md` holds every number with its source and what it does not say. Three
things are worth building an argument on:

1. **Divergence concentrates where decisions are hard.** QB1 1.4%, RB1 4.5%, TE1 6.8%.
   WR3 22.3%. The flex tier managers actually agonize over: 22.3%. The display works where
   it does not matter and fails where it does. Do not claim a smooth gradient, it is noisy
   in the middle.
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
