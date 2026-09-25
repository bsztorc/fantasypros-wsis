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
