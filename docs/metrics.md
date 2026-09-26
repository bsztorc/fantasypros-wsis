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

**What the 27% does not say.** It is the share across all requests, including positions
where a multi-slot question is impossible. Among RB, WR and FLEX requests, where filling
two slots from the same group can actually happen, the share should be materially higher.
That re-cut has not been done, so do not assert it. If asked, the honest answer is that
27% is the conservative floor.

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

Source: 725 entries across nine ranking lists, 395 distinct players, captured
2026-09-25. Ballots reconstructed from published dispersion, 46 experts.
Reproducible with `node scripts/measure-divergence.mjs`.

**Validation.** Simulating 46 ballots for Hampton against Hubbard gives 27 to 19.
FantasyPros publishes 26 to 20. One ballot out of 46.

### Divergence rate: how often the expert-preferred pair differs from the top two by first-choice share

| Tier | Rate |
|---|---|
| QB1 | 1.4% |
| RB1 | 4.5% |
| TE1 | 6.8% |
| WR2 | 8.6% |
| WR4 | 11.8% |
| **WR3** | **22.3%** |
| **FLEX1** (top half RB3 + all WR3) | **22.3%** |
| FLEX2 (rest of RB3, WR4, TE2) | 9.9% |

**The headline, worded correctly:**

> In the flex decision managers actually agonise over, the pair experts would start
> differs from the top two by first-choice share **22.3% of the time**.

**Wordings to avoid.** "Flex represents 22.3% of the ranking divergence" says something
different and false: it reads as flex accounting for 22.3% of all divergence across the
board. The 22.3% is a **rate within flex comparisons**, not flex's share of a total.

**One claim not yet evidenced.** That flex is the position users ask about most is
plausible and not established by the sample. Either re-cut the sample to support it or
drop the clause. As it stands the tier data shows where divergence is highest, not where
demand is highest.

**Do not claim a smooth gradient.** RB3 (5.0%) sits below RB2 (6.4%), and WR4 (11.8%)
below WR3 (22.3%).

**Expect this question:** FLEX2 has higher dispersion than FLEX1 (9.19 against 8.01) but
lower divergence. Dispersion alone does not drive divergence; the players also have to be
close in value. FLEX2 contains many lopsided pairings, and lopsided comparisons never
diverge.

**Robustness.** The rate holds between 1.8% and 2.8% board-wide across correlation
settings and random seeds, so it is a property of the published dispersion rather than of
the model.

---

## Sizing model

Given without the inputs, since FantasyPros holds them:

> (share of comparisons with 3+ players) × (divergence rate) × (weekly comparison volume)
> = decisions per week where the user likely starts the wrong second player

The middle term is the one this repo supplies: **22.3%** for the flex tier, which is the
comparison the feature exists for.

---

## Success measures

Adoption: share of 3+ player comparisons that set Start N above 1. Decision completion:
sessions reaching a recommendation against sessions bouncing. Week-over-week return rate.
**Sync conversion from this tool**, which is the metric Mike named as most important.
Tool-hopping: whether users who get a Start-N answer stop bouncing to the Sit/Start
Assistant. Support volume on "why does it say X".
