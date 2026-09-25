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

## 2026-09-25 — Removal affordance

**Human correction:** the first pass made the whole player card a remove button. Brandon
asked for an explicit X in the slot corner instead, with the card itself inert, so removal
happens only through the X or by deselecting in the list below. Click-to-remove on a card
the user is reading is easy to trigger by accident and gives no sign it is possible.

## 2026-09-25 — Advice view

**Prompt:** build the signed-out, two-player advice view, using the live product page as
the reference.

**What the agent did:** read the live comparison page rather than working from a
screenshot, which gave exact copy, the eleven-tab list, the gated module treatment and
the class structure. Built the vote maths as a real function so percentages are computed
from the fixture model, using the largest remainder method so votes sum to the pool.

**What the screenshots corrected, after they arrived:**
- The results band uses two different layouts, not one. Two players get mirrored cards of
  equal weight; three or more collapse the non-leading players into compact cards. The
  first implementation used uniform cards for every count and had to be rebuilt.
- The expert pool is not a constant. It is the set of experts who ranked every player, so
  it shrinks when positions are mixed: 45 for three running backs, 42 once a wide receiver
  replaces one. Implemented as `expertPoolFor`.
- Search copy is contextual: "Add a third player", then "Add a fourth player".
- The Coach AI summary is absent once three or more players are compared, which the brief
  suspected and the screenshots confirmed.

**Tooling note:** the dev server wedged mid-session and took the browser pane with it.
The production build was used to confirm the application itself was healthy before
restarting the server, rather than guessing.

## 2026-09-25 — Premium gating

**Human decision:** Brandon reviewed the Sentiment finding and decided Lineup Goal should
match the gating of the meters it reads: Balanced for everyone, Most Upside and Safe Floor
for premium. He also spotted that the demo state label was wrong. "Signed In, League
Synced" implied sync would unlock those meters, and it does not, so it became "Premium,
League Synced".

**What the agent got right:** it flagged the constraint rather than quietly building
Lineup Goal against data most users cannot see, and it checked three screenshots including
a synced one before claiming the wall was a premium wall rather than a sync wall.

**What the agent should have caught earlier:** the non-premium Sentiment module shows the
Overall row and locks only the other two. The first implementation blurred the whole
module behind one overlay, which was less faithful and, more importantly, hid the detail
that makes the argument: the product already splits a module across tiers.

## 2026-09-25 — Review corrections

Three corrections from Brandon after using the prototype, all of which the agent had
missed by testing pieces rather than walking the demo end to end:

- **The gated controls had no upgrade prompt.** A dimmed segment with a tooltip reads as a
  broken control. It now carries the product's own prompt, and which one depends on what
  the user actually has to do next: sign up when signed out, upgrade when signed in free.
- **The two new controls were missing from the advice view.** They existed only on the
  selection screen, so a user could not change goal or Start N while looking at the
  answer, which is exactly when they would want to.
- **Switching demo state dumped the user back to selection with an empty comparison.** The
  agent had reset everything deliberately, reasoning that each walkthrough should start
  clean. That was wrong. The demo arc is picking players, seeing the answer, then changing
  state and watching the same decision get better or worse. Clearing it made the only
  interesting comparison impossible to see.

State changes now keep the comparison, trimming players that exceed the new state's slot
limit and leaving the advice view only if too few remain. Four players on premium becomes
two when switched to signed out, and stays on the advice page.

## 2026-09-25 — Making the gate legible

**Human correction:** the upgrade prompt was styled as a button and sat beside the Lineup
Goal control with nothing tying it to the locked options. It read as a floating action
rather than an explanation.

Two changes. Padlocks now sit beside Most Upside and Safe Floor, so the prompt has a
visible referent. The prompt itself is inline text rather than a button, matching the
tool's other inline prompts, because it explains a limit rather than offering an action
on the same footing as choosing a goal.

The padlock is opt-in per option rather than automatic for anything disabled. Start N's
unavailable options are conditional on how many players are in the comparison, not
withheld by tier, and marking them locked would claim something untrue.

## 2026-09-25 — Column alignment

**Human correction:** with three or more players the leading player was not getting the
larger card, and no player's card lined up with his own column of data below.

Fixed by giving the results band and the comparison tables a single shared geometry in
`src/lib/layout.ts`. The leader spans two column units, every other player spans one, and
both grids reserve the same fixed strip for Add Player, so the two divide the remaining
width into the same number of fractional units.

**Two things had to be true for it to actually line up, and the first attempt missed both:**

- `calc(1fr + 104px)` is not valid CSS. Fractional units cannot appear inside `calc`, so
  the browser discarded the whole declaration and the tables silently fell back to no
  explicit columns. The fix was a trailing spacer track instead of trying to widen the
  last column.
- The two grids had different horizontal extents. The table rows carried padding and
  column gaps the band did not, and the content wrapper inset the tables by twenty pixels.
  Identical track definitions are not enough when the containers start at different
  positions. Padding moved inside the cells and the wrapper inset was removed.

Verified by measuring rendered element edges rather than by eye: every card edge matches
its column edge exactly at both three and four players.
