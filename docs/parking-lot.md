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
- **Moderate is grey**, not amber. Colour tracks whether the level favours the player.
- **Bust Risk is inverted**, which the earlier guess had right: a high bust risk renders
  red, a very low one green.
- **Most Accurate Experts shows percentages, not ranks**, and they are first-choice shares
  within a subset of the pool.

That last one is the most useful finding, and it strengthens the argument in the brief.
In the screenshot the most accurate experts prefer **Hubbard at 58%** while the full pool
prefers **Hampton**. The product already publishes a case where a subset of experts
disagrees with the headline number.

This is worth using in the write-up. It is not an edge case invented to make a point: it
is the product's own data showing that a single percentage summarises votes rather than
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

How often the expert-preferred pair differs from the top two by first-choice share, in a
twelve-team league where the top twelve at a position are everyone's starter at that slot.
Three players from the same tier, filling two slots, against the Week 3 snapshot.

| Tier | Divergence | Dispersion |
|---|---|---|
| RB1 (1-12) | 1.4% | 1.15 |
| RB2 (13-24) | 5.0% | 2.20 |
| RB3 (25-36) | 6.4% | 2.54 |
| RB4 (37-48) | 36.8% | 4.52 |
| WR1 (1-12) | 9.5% | 1.36 |
| WR2 (13-24) | 5.5% | 2.16 |
| WR3 (25-36) | 23.6% | 4.11 |
| WR4 (37-48) | 20.0% | 4.53 |
| FLEX1 (1-12) | 3.2% | 1.27 |
| FLEX4 (37-48) | 16.4% | 4.78 |
| FLEX6 (61-72) | 32.7% | 7.94 |

**The finding is not the average, it is the shape.** Divergence tracks expert uncertainty
almost perfectly. At the top of the board, where nobody needs advice, first-choice share
is a fine proxy for the right answer: RB1 and QB1 sit at 1.4%. In the flex range, where
managers actually agonise, it is wrong between one in six and one in three times.

So the current display works where it does not matter and fails where it does. That is a
better argument than any average, and it is the one to lead with.

**Caveat to state rather than bury:** the QB4 tier shows 50%, but that is two divergent
cases out of four possible combinations, which is noise. Tiers with fewer than roughly
twenty combinations should not be quoted.
