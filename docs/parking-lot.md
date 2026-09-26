# Parking Lot

Ideas raised during the build that are deliberately not in scope, kept here so they are
available for the write-up and the presentation rather than lost in a chat log.

## Recommended Searches

Replace the existing **Popular Searches** module with **Recommended Searches**, generated
from the synced user's own close calls rather than from sitewide popularity.

- **Why it fits:** Popular Searches is the same "what is everyone else looking at"
  pattern as the Top Players default. It is a comparison-tool affordance on a page that
  is trying to become a decision tool.
- **Why it is not in this build:** it depends on the recommendation engine being able to
  identify a close call, which does not exist yet.
- **Status:** candidate for the improvements list in the written deliverable, not for the
  prototype.

## Combination logic for correlated players

For N greater than 1, top-N by weighted score is correct when players are independent.
Combinations only matter when players are correlated: same game, or two high-variance
plays when the goal is a safe floor.

- **Status:** v2 consideration, called out in the dev spec rather than built. The
  selection step is worth structuring as a replaceable function so the seam is visible.

## Pre-populated synced default

The brief describes a synced landing state of "You have 2 decisions this week", with
close calls pre-populated from roster and open slots, in place of the current top-players
list.

- **Status:** considered and set aside for this iteration. The concept design keeps the
  standard empty-slot default. Revisit once the engine can identify close calls.

## Constraint found in the variant screenshots

**Upside Potential and Bust Risk are premium-gated.** In the signed-in, non-premium state
the Sentiment module shows the Overall meter but locks the other two behind "Upgrade to
Premium".

This matters because Lineup Goal is specified to weight Overall, Upside and Bust. Two of
the three inputs are not available to a free signed-in user, so one of the following has
to be true:

- Lineup Goal is a premium feature, which conflicts with the principle of never gating
  the answer, or
- Lineup Goal is computed server side from data the user never sees directly, so the
  gating applies to the meters rather than to the recommendation, or
- Most Upside and Safe Floor are derived from something already visible, such as the
  projection spread and matchup rating, rather than from the gated meters.

The third reads as the most defensible: the user gets a differentiated recommendation
without being shown gated data, and the meters remain a premium upsell. Worth resolving
explicitly in the dev spec rather than leaving implied.

## Expert pool is not fixed

Observed across the screenshots: three running backs draw 45 experts, while swapping one
for a wide receiver drops the pool to 42. The pool is the set of experts who ranked every
player in the comparison, so mixing positions shrinks it.

This is the mechanism behind the consensus-strength ceiling in the brief. A comparison
with few shared experts cannot support a strong claim no matter how lopsided the split.
The prototype models this as `expertPoolFor` in `src/lib/consensus.ts`.

### Resolved: Lineup Goal gates with its data

Decided 2026-09-25. Lineup Goal matches the gating of the meters it reads.

- **Balanced** is available to everyone. The recommendation itself is never gated.
- **Most Upside** and **Safe Floor** require premium, because they are weighted from
  Upside Potential and Bust Risk.

This also changed the demo states. "Signed In, League Synced" was renamed **"Premium,
League Synced"**, because league sync does not lift the premium wall and the old label
implied a tier that would still see two of the three meters locked.

The three demo states are now Signed Out, Signed In / No League Synced, and Premium /
League Synced.

**Consequence worth stating in the write-up:** the feature's headline control is
differentiated by tier. A free user gets a lineup-aware recommendation, just not a
goal-weighted one. That is arguably the right commercial shape, since it gates the
personalisation rather than the answer, but it should be a deliberate decision rather
than a side effect of where the meters happen to sit today.

### Resolved: the premium meters, from the unlocked screenshots

Brandon supplied premium screenshots on 2026-09-25, replacing two inferences with facts.

- **The scale has five named levels**, not three: Very Low, Low, Moderate, High, Very High.
- **Moderate is gray**, not amber. Colour tracks whether the level favours the player.
- **Bust Risk is inverted**, which the earlier guess had right: a high bust risk renders
  red, a very low one green.
- **Most Accurate Experts shows percentages, not ranks**, and they are first-choice shares
  within a subset of the pool.

That last one is the most useful finding, and it strengthens the argument in the brief.
In the screenshot the most accurate experts prefer **Hubbard at 58%** while the full pool
prefers **Hampton**. The product already publishes a case where a subset of experts
disagrees with the headline number.

This is worth using in the write-up. It is not an edge case invented to make a point: it
is the product's own data showing that a single percentage summarizes votes rather than
settling the question. The prototype models it with `subsetShares`, where each subset
perturbs the weighting so it can legitimately disagree with the headline.

## Deliberate divergence: always explain the recommendation

The live tool shows the Coach AI summary at two players and drops it at three or more.
The prototype always shows it.

**Why this is a change worth proposing on its own merits,** separately from Start N:

A real comparison from the product, captured 2026-09-25. Hampton leads the vote at 43% to
Hubbard's 39%. Hubbard is ahead on season total, season average, all three sentiment
meters, and all three most-accurate-expert subsets, where he leads 58 / 54 / 40. Hampton
wins on exactly two rows: projection average, 13.9 to 11.5, and matchup rating, five stars
to one.

Both can be true. The vote is forward-looking and most of the page is backward-looking. But
the page does not say so at three players, because that is where the summary disappears.
The comparison gets harder, the gap between the headline and the evidence widens, and the
explanation is withdrawn exactly then.

**This also makes Start N safe.** Above one slot the recommended combination can differ
from the top N by displayed percentage. Showing a set that does not match the visible
ordering without explaining it would reproduce the same confusion deliberately, at larger
scale. The summary is load-bearing for the feature, not decoration beside it.

Note the scope this implies. The prototype does not change how players are ranked or how
the head-to-head consensus is computed. It changes how existing ranking data is aggregated
into an answer when N is greater than one, and it always explains the result.

## Divergence measured against roster tiers

How often the expert-preferred pair differs from the top two by first-choice share. Three
players from the same tier, filling two slots, against the Week 3 snapshot, 46
reconstructed expert rankings.

Tiers follow how rosters and rankings actually work, not even blocks. QB caps at 32
because only 32 quarterbacks start in the NFL. RB stops at RB3 and TE at TE2, because
beyond that nobody is a startable option. WR runs to four tiers, since the position goes
deeper than any other. Flex is filled from the players who missed a positional slot:
RB3, WR3, WR4 and TE2, compared across positions.

### Blocks of twelve

| Tier | Divergence | Cases | Dispersion |
|---|---|---|---|
| QB1 (1-12) | 1.4% | 3/220 | 1.00 |
| QB2 (13-24) | 8.6% | 19/220 | 1.97 |
| QB3 (25-32) | 12.5% | 7/56 | 2.37 |
| RB1 (1-12) | 4.5% | 10/220 | 1.15 |
| RB2 (13-24) | 6.4% | 14/220 | 2.20 |
| RB3 (25-36) | 5.0% | 11/220 | 2.54 |
| WR1 (1-12) | 10.9% | 24/220 | 1.36 |
| WR2 (13-24) | 8.6% | 19/220 | 2.16 |
| **WR3 (25-36)** | **22.3%** | 49/220 | 4.11 |
| WR4 (37-48) | 11.8% | 26/220 | 4.53 |
| TE1 (1-12) | 6.8% | 15/220 | 1.51 |
| TE2 (13-24) | 4.5% | 10/220 | 2.21 |

### Flex, split in two

Flex is filled by whoever missed a positional slot, but not every candidate represents a
real dilemma. Splitting it separates the decision a manager agonises over from the rest of
what can legally fill the slot.

| Tier | Composition | Divergence | Cases | Dispersion |
|---|---|---|---|---|
| **FLEX1** | top half of RB3, all of WR3 | **22.3%** | 182/816 | 8.01 |
| FLEX2 | rest of RB3, WR4, TE2 | 9.9% | 401/4060 | 9.19 |

### What to claim, and what not to

**Lead with this:** in the flex decision managers actually agonise over, the expert
preferred pair differs from the top two by first-choice share **22.3% of the time**. More
than one in five. The same figure holds for WR3 measured on its own, which is unsurprising
since WR3 supplies twelve of FLEX1's eighteen players, and the agreement between two
independently constructed pools is worth more than either number alone.

**The contrast carries the argument.** QB1 is 1.4%, RB1 is 4.5%, TE1 is 6.8%. The display
is a fine proxy for the right answer in the tiers where nobody needs help, and wrong more
than one time in five where they do. That is a better line than any board-wide average,
and it pre-empts "so it is right most of the time", which is only true of the comparisons
nobody makes.

**Note FLEX2 is lower despite higher dispersion.** 9.9% against 22.3%, on a wider spread.
Dispersion alone does not drive divergence; a pool needs players who are genuinely close
in value. FLEX2 contains many pairings that are lopsided, and lopsided comparisons never
diverge. State this before someone finds it, because on the surface it looks like it
undercuts the mechanism when it actually sharpens it.

**Do not claim a smooth gradient.** RB3 (5.0%) sits below RB2 (6.4%), and WR4 (11.8%) below
WR3 (22.3%). The relationship with uncertainty is real at the extremes and noisy between.

**QB3 is a thin sample.** Eight players, 56 comparisons. Directional at best.

## Pinned: the expert panel is modeled, not measured

The panel thins when positions are mixed, which matches the product: 46 experts for a
comparison of running backs, 43 once a receiver joins them, against 45 to 46 and 42
published. The rule is 46 experts minus 3 for each position beyond the first, calibrated against
three observed comparisons.

It is a model, not data. FantasyPros knows exactly which experts ranked which players; the
snapshot does not carry that, so the real panel would differ per comparison in ways this
cannot reproduce. Fine for a prototype, and worth stating plainly rather than letting the
number look measured.

Revisit if consensus strength gets built, since expert count is what caps it.
