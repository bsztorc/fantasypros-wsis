# Metrics Log

Every number used in the deliverable, with where it came from and what it does not say.
The point of the second half of each entry is that a number quoted slightly wrong is worse
than one not quoted at all.

Three sources, kept separate on purpose:

- **Primary research** — Brandon's own sample of start/sit requests
- **Product observation** — read from the live product or from captured screenshots
- **Computed** — derived from the Week 3 rankings snapshot in this repo

---

## Primary research

Sample of 100 start/sit requests from Reddit and Sleeper threads.

| Metric | Value |
|---|---|
| Single-slot requests (N=1) | 73% |
| **Multi-slot requests (N>1)** | **27%** |
| Requests giving context beyond scoring or roster format | **31%** |

**Do not add these two.** 27% and 31% are overlapping sets. "58% unserved" is wrong and
will be caught.

**What the 27% does not say.** It is the observed rate across the sample, nothing more.

Do not describe it as a conservative floor on the grounds that some positions cannot be
multi-slot. That reasoning is wrong. A superflex or flex slot accepts QB, RB, WR and TE,
so a multi-slot question is possible at every offensive position. Only DST is structurally
single-slot, and no DST posts appear in the sample, so DST is not in the denominator
either.

**The re-cut worth doing is by decision type, not by position.** The brief suggests
excluding QB, TE, K and DST to isolate "positions where multi-slot is even possible", but
that would discard legitimate superflex cases. The meaningful split is whether the poster
is filling a flex or superflex slot, where several positions compete for one spot, or a
strict positional slot. Until that is cut, 27% stands on its own with no adjustment
claimed in either direction.

**What the sample shows about the multi-slot subset.** These describe the N>1 requests,
the 27%, not the sample as a whole. Reviewed but not yet counted:

- No multi-slot request was QB-only, and none pitted QB against TE.
- QB questions are almost always single-slot.
- Most multi-slot requests involve wide receivers. Some are running backs or a mix of
  both. Tight ends are rare.

**This rehabilitates the re-cut, on different grounds.** Superflex means a multi-slot QB
question is *possible*, so the structural argument for excluding QB and TE does not hold.
But the sample shows it does not *happen*. Excluding them is therefore justified by
observation rather than by theory, which is the better footing: it is a finding about what
users do, not an assumption about how leagues are configured.

Stated safely: **every multi-slot request in the sample was a running back, wide receiver
or mixed decision.** That is a claim about the sample, it is checkable, and it does not
depend on league format.

**Open work Brandon is doing:** counting the position mix of the multi-slot requests, so
"most involve wide receivers" becomes a number rather than an impression.

**Dominant theme in the extra context:** injury uncertainty, specifically whether a
questionable player will suit up and the problem of not knowing before a Sunday or Monday
night game.

**Also observed:** most requests list two or three options, sometimes four, never more
than four, which validates the existing 2-4 input range.

---

## Product observation

| Finding | Detail |
|---|---|
| Percentages are first-choice vote share | Three-player comparison values sum to 100 |
| Head-to-head example | 58% + 42% from 26 + 19 of 45 experts |
| Expert pool is not fixed | 45 for three running backs, 42 when a wide receiver replaces one |
| Coach AI summary | Present at two players, absent at three or more |
| Upside Potential and Bust Risk | Premium, and league sync does not unlock them |
| Sentiment Overall | Visible to signed-in free users |
| Access tiers | Signed out compares two players only |
| Information tabs | Eleven on the comparison view |

**The most accurate experts can disagree with the headline.** In a captured three-player
comparison the full pool preferred Hampton at 43%, while all three accuracy-filtered
subsets preferred Hubbard: 58%, 54% and 40%.

**Why that comparison is confusing, tallied row by row.** Hampton leads on exactly two
rows, projection average (13.9 to 11.5) and matchup rating (five stars to one). Hubbard
leads on season total, season average, all three sentiment meters and all three expert
accuracy subsets. Both can be true: the vote is forward-looking and most of the page is
backward-looking. The page does not say so, and at three players the summary that would
have said so is gone.

**Do not present cross-tool disagreement as a discovery.** It is documented in their
support library and has been for years. The stronger line is that a product needing a
support library to explain why its own recommendations disagree is not explaining itself.

---

## Computed from the Week 3 snapshot

Source: a reconstructed snapshot of FantasyPros' published rankings at a moment in time.
765 entries across nine ranking lists, 435 distinct players, captured 2026-09-26. A panel
of 46 expert rankings reconstructed from the published dispersion: best rank, worst rank,
average and standard deviation per player. Reproducible with `npm run check:divergence`.

The snapshot is frozen so the demo is repeatable, and `npm run build` fails if it moves.
See `docs/handoff.md`.

**What the reconstruction is.** It reproduces how much the experts disagree, not who said
what. Individual expert rankings are not published in bulk, so the panel is built to match
the published dispersion rather than recovered from it. It was checked once against a
published head-to-head, which was enough to confirm the snapshot behaves like the real
product, and that check is not a standing gate. **Claim nothing more than a reconstructed
snapshot of the published rankings at a moment in time.** No precision claim, and do not
offer an expert count as proof of accuracy.

### Divergence rate: how often the expert-preferred pair differs from the top two by first-choice share

**Reported as a range, and the reason matters more than the numbers.** The published
dispersion constrains a reconstructed panel without determining it, so any single run is one
of many panels consistent with the same published data. An earlier draft of this file quoted
22.3% for the flex tier. That figure was a property of the random seed rather than of
FantasyPros' rankings, and a reviewer re-running the script with a different seed would not
have reproduced it. **22.3% is superseded. Do not use it.**

Twenty-four reconstructions per tier, three correlation settings by eight fixed seeds.
Reproducible with `npm run check:divergence`.

| Tier | Range | Median |
|---|---|---|
| **FLEX1** (top half RB3 + all WR3) | **13.7 - 30.5%** | **21.6%** |
| WR3 | 13.2 - 29.1% | 20.9% |
| WR4 | 8.2 - 20.9% | 14.1% |
| FLEX2 (rest of RB3, WR4, TE2) | 9.7 - 16.0% | 12.7% |
| WR1 | 4.5 - 11.4% | 6.6% |
| TE2 | 1.8 - 11.4% | 6.4% |
| RB2 | 3.2 - 9.5% | 6.1% |
| RB3 | 4.1 - 12.7% | 6.1% |
| WR2 | 1.4 - 10.0% | 5.0% |
| QB2 | 0.9 - 6.4% | 3.6% |
| RB1 | 0.5 - 4.1% | 2.5% |
| TE1 | 0.0 - 7.7% | 1.8% |
| QB1 | 0.0 - 3.6% | 0.9% |

QB3 is deliberately absent: eight players and fifty-six comparisons, too thin to report. The
script prints it and marks it thin.

**The headline, worded correctly:**

> In the flex decision managers agonise over, the pair experts would start differs from the
> top two by first-choice share **between 14% and 30% of the time**, median 22%, depending on
> how the expert panel is reconstructed.

**What survives every reconstruction is the ordering**, which is what the feature rests on:

- FLEX1 diverges more often than FLEX2 in all 24 runs.
- FLEX1 diverges more often than every top-of-position tier, QB1, RB1, WR1 and TE1, in all 24
  runs.
- WR3 is the highest of the twelve-player blocks in 20 of the 24 runs.

**Wordings to avoid.**

- **Any single figure.** The range is the result. Quoting one number invites a reviewer to
  reproduce it, and they will not.
- **"An order of magnitude higher than the top of a position."** True at the medians, roughly
  22% against 1% to 3%, but in the least favourable run the gap narrows to 1.6x. Say several
  times higher, or quote the medians and say so.
- **"Flex represents 22% of the ranking divergence."** Says something different and false: it
  reads as flex accounting for 22% of all divergence across the board. It is a **rate within
  flex comparisons**, not flex's share of a total.
- **"WR3 is the highest-divergence tier"** unqualified. It is the highest twelve-player block
  in 20 of 24 runs, and FLEX1 sits above it.

**Demand and divergence point at the same place.** The multi-slot requests are wide receiver
heavy, and every one of them is a running back, wide receiver or mixed decision. WR3 is the
highest-diverging twelve-player block in most runs, and WR3 supplies twelve of FLEX1's
eighteen players. Where users ask most is where the current display is least reliable.

**Do not state that as a proven correlation.** Two observations lining up is not a
demonstrated relationship, and the position mix is reviewed rather than counted. Present
it as what it is: multi-slot demand is concentrated in the same tier the divergence is,
which is why the feature is worth building there first.

**Do not claim a smooth gradient.** Adjacent tiers overlap heavily and some invert outright:
WR2's median (5.0%) sits below WR1's (6.6%), RB2 and RB3 share a median at 6.1%, and TE1
(1.8%) sits below QB2 (3.6%). Only the flex tier and WR3 separate cleanly from the rest.

**Expect this question:** FLEX2 has higher dispersion than FLEX1 (10.46 against 8.10) and yet
diverges less, in all 24 runs. Dispersion alone does not drive divergence; the players also
have to be close in value. FLEX2 contains many lopsided pairings, and lopsided comparisons
never diverge.

---

## Sizing model

Given without the inputs, since FantasyPros holds them:

> (share of comparisons with 3+ players) × (divergence rate) × (weekly comparison volume)
> = decisions per week where the user likely starts the wrong second player

The middle term is the one this repo supplies: **13.7% to 30.5%, median 21.6%** for the flex
tier, which is the comparison the feature exists for. Run the sizing at the low end of the
range rather than the median if it needs to be conservative.

---

## Success measures

Adoption: share of 3+ player comparisons that set Start N above 1. Decision completion:
sessions reaching a recommendation against sessions bouncing. Week-over-week return rate.
**Sync conversion from this tool**, which is the metric Mike named as most important.
Tool-hopping: whether users who get a Start-N answer stop bouncing to the Sit/Start
Assistant. Support volume on "why does it say X".
