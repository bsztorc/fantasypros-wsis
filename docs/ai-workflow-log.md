# AI Workflow Log

A running record of how this prototype was built with Claude Code: what was prompted,
what the model got wrong, and what needed human correction. Kept because the process is
part of what is being evaluated.

## 2026-09-25 — Scaffold

**Prompt:** Read the locked build brief, then set up the repo and deployment path.

**What the agent did:** Read the brief, checked local tooling (Node 24.18, npm 11.16,
git 2.55, gh 2.97, no Vercel CLI), scaffolded Next.js 16 / React 19 / TypeScript /
Tailwind 4 via `create-next-app`, verified `npm run build` passes before any push.

**Human decisions the agent did not make on its own:**
- Repo is public, and separate from the interview-prep working directory. The prep
  directory holds a candidate profile and research on the interviewers; that must not
  ship in a repo FantasyPros can read.
- No backend, no database, no API keys. Fixture data only, so that every claim about
  what is real in the prototype is defensible.

**Corrections:** none yet.

## 2026-09-25 — Branching model

**Human correction:** the first feature branch was cut from `main`. Brandon asked for a
git-flow model instead: `develop` as the integration branch, features cut from `develop`,
`main` reserved for production. The branch was deleted and re-cut. GitHub is configured to
allow squash merges only, with `develop` as the default branch so pull requests cannot
accidentally target `main`.

## 2026-09-25 — WSIS landing page

**Prompt:** recreate the current Who Should I Start? landing page so the prototype reads as
the real product, add a demo-state switcher, and add the two new controls.

**What the agent did well:** rather than eyedropping colours from the concept PNG, it read
computed styles off the live FantasyPros page (Poppins, the `#061F47` panel, the 48px pill
search input) and sampled the concept image pixel by pixel with .NET for the values the
live page could not show, including the position badge colours. The Start N gating rule was
built as a pure function and verified against four cases in the browser.

**What needed correcting:**
- The agent proposed building the recommendation engine first. Brandon redirected to the
  landing page, which is the right call: the page is the thing being evaluated, and the
  engine has no surface without it.
- The supplied logo is a dark-background variant, so the white glyph would have vanished on
  the white header. Mounted on a navy chip instead, matching the product's own sidebar.
- Roster names truncated at narrow viewports; the two-column split now holds until `lg`.
- The longest demo-state label was clipped by the select width.

**Deliberately not done:** the View Advice button enables at two players but does not yet
produce advice. The recommendation output is the next deliverable, and stubbing a fake
result would misrepresent what is real.
