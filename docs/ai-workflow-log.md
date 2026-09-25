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
