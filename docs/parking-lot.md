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
