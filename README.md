# Who Should I Start? — Lineup-Aware Prototype

**Live:** https://fantasypros-wsis.vercel.app/

A prototype exploring one change to a player-comparison tool: let the user say how many
lineup spots they are filling, and recommend the expert-preferred *combination* rather
than a single winner.

## The problem

Fantasy managers frequently need to fill more than one lineup spot from the same group of
eligible players. The tool calculates each expert's *first* choice only. Because the
results are displayed in order, users read them as a ranking. The second-place player is
not necessarily the one experts would pair with the winner.

The math is not wrong. The input model is narrower than the decision the user arrived with.

## Status

The landing page and the signed-out advice view are built. The lineup-aware recommendation is not.

| Area | State |
|---|---|
| Landing page, three demo states | built |
| Start N and Lineup Goal controls | built, gating logic verified |
| Advice view, signed out, two players | built |
| Advice view, three and four players | not started |
| Recommendation engine | not started |
| Dev spec | not started |

## What is real vs. stubbed

Tracked honestly and updated as the build progresses, because the distinction matters more
than the demo.

- **Real:** the scoring and recommendation logic, computed from fixture data at runtime.
- **Fixture:** expert rankings, rosters, matchup state, and availability. No API, no
  database, no keys. Deterministic by design so results are reproducible in a walkthrough.
- **Stubbed:** anything the existing product already does well, including the AI summary
  and the information tabs. Rebuilding those is not the point of the exercise.

## Stack

Next.js 16, React 19, TypeScript, Tailwind 4. Deployed on Vercel from `main`.

```bash
npm install
npm run dev
```

## Build notes

`docs/ai-workflow-log.md` records how this was built with an AI coding agent: what was
prompted, what needed correcting, and which decisions were made by a human rather than
the model.
