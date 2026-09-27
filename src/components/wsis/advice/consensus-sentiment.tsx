import { bustRoom, upsideRoom } from "@/lib/expert-rankings";
import type { PlayerResult, Recommendation } from "@/lib/engine";
import { availabilityNote, availabilityRisk } from "@/lib/team-context";

/**
 * Stub of the product's existing Coach AI summary.
 *
 * The numbers are real: they come from the same reconstructed panel as the rest of the
 * view. The prose around them is templated rather than generated. Rebuilding Coach AI is
 * not the point of this prototype, and a fake model call would be worse than an honest
 * template.
 *
 * DELIBERATE DIVERGENCE FROM THE PRODUCT: the live tool shows this summary at two players
 * and drops it at three or more. That is backwards. The comparison gets harder as players
 * are added and the gap between the headline percentage and the supporting data widens,
 * so the explanation is withdrawn exactly when it is most needed. Here it always renders.
 *
 * The summary answers in this order: what to start, why those players, why each of the
 * others is out, what the lineup goal changed, and what the user's own roster adds. It
 * quotes only expert counts, never a percentage the screen is not showing: above one slot
 * the individual shares are deliberately absent, and explaining the result in terms of
 * numbers a reader cannot see is worse than not explaining it.
 */

const COUNT_WORD = ["", "one", "two", "three", "four", "five"];

/**
 * How a player's support changes as slots open up.
 *
 * A divisive player gains almost nothing: the experts who like him already had him first,
 * and the rest have him last, so he is rarely anyone's middle pick.
 */
function gain(result: PlayerResult): number {
  return result.inclusionShare - result.firstChoiceShare;
}

/**
 * Why one player did not make the lineup.
 *
 * Every excluded player gets a reason. Leaving that to the reader is what the current
 * display does: it shows an ordering, says nothing about what the ordering means, and lets
 * them infer that second place is the next best start. Each reason is stated in the same
 * expert counts the recommendation itself is built from.
 */
function whyNotStarted(result: PlayerResult, weakestStarter: PlayerResult | undefined): string {
  const name = result.player.name;

  if (result.inclusionShare === 0) {
    return `no expert would start ${name} over these`;
  }

  if (result.firstChoiceShare === 0) {
    // Broad support with no first-place votes is a real position, and "only" misdescribes it
    // once the share passes half. He is not disliked, he is nobody's favourite.
    if (weakestStarter && result.inclusionShare >= 40) {
      return (
        `nobody ranks ${name} the best of these, and while ${result.inclusionShare}% would ` +
        `still start him that trails ${weakestStarter.inclusionShare}% for ` +
        `${weakestStarter.player.name}`
      );
    }
    // "Would start him at all" reads as a verdict on the player. The share is relative to
    // this comparison and nothing else: it counts experts whose own top N, drawn from these
    // players, includes him. Every sentence here has to keep that scope visible.
    return (
      `nobody ranks ${name} the best of these, and only ${result.inclusionShare}% would start ` +
      `him over the others`
    );
  }

  // A divisive player is the interesting exclusion: he looks like the obvious next pick on
  // first-place votes alone, and is the reason the two questions give different answers.
  if (gain(result) <= 8) {
    return (
      `${name} splits the panel: ${result.firstChoiceShare}% rank him the best of these, but ` +
      `most of the rest rank him last, so he is seldom anyone's second pick`
    );
  }

  if (!weakestStarter) {
    return `only ${result.inclusionShare}% would start ${name} over the others`;
  }

  const margin = weakestStarter.inclusionShare - result.inclusionShare;
  if (margin <= 10) {
    return (
      `${name} is the closest call: ${result.inclusionShare}% would start him against ` +
      `${weakestStarter.inclusionShare}% for ${weakestStarter.player.name}`
    );
  }

  return (
    `${name} trails on the same question: ${result.inclusionShare}% would start him against ` +
    `${weakestStarter.inclusionShare}% for ${weakestStarter.player.name}`
  );
}

/** Every exclusion, as one sentence. */
function exclusions(recommendation: Recommendation): string {
  const starters = recommendation.results.filter((result) => result.recommended);
  const benched = recommendation.results.filter((result) => !result.recommended);
  if (benched.length === 0) return "";

  const weakestStarter = [...starters].sort((a, b) => a.inclusionShare - b.inclusionShare)[0];

  const reasons = [...benched]
    .sort((a, b) => b.inclusionShare - a.inclusionShare)
    .map((result) => whyNotStarted(result, weakestStarter));

  const lead = benched.length === 1 ? "The one left out:" : "The others:";
  return ` ${lead} ${listOf(reasons)}.`;
}

/** The recommendation and the expert support behind it. Answers the question asked. */
function answerParagraph(recommendation: Recommendation): string {
  const { results, panelSize, startN, combinationShare } = recommendation;
  const starters = results.filter((result) => result.recommended);
  const [leader] = results;

  if (startN === 1) {
    const rest = results.slice(1);

    // A runaway favorite leaves everyone else on nought, which reads as though the rest are
    // equally bad. They are not being compared at all: nobody ranked any of them first.
    if (rest.every((result) => result.firstChoiceShare === 0)) {
      return (
        `All ${panelSize} experts make ${leader.player.name} their first choice, so the ` +
        `${COUNT_WORD[rest.length] ?? rest.length} others each show 0%. That counts first ` +
        `picks only, and says nothing about which of them to start next to him.`
      );
    }

    return (
      `${leader.firstChoiceVotes} of ${panelSize} experts make ${leader.player.name} their ` +
      `first choice, ahead of ` +
      listOf(rest.map((result) => `${result.player.name} at ${result.firstChoiceShare}%`)) +
      `.`
    );
  }

  const agreeing = Math.round((combinationShare / 100) * panelSize);
  const [firstStarter, ...otherStarters] = starters;

  const named = listOf(starters.map((r) => r.player.name));
  const answer =
    `${agreeing} of ${panelSize} experts would start ${named}, more than any other ` +
    `combination of these ${COUNT_WORD[results.length] ?? results.length}.`;

  const why =
    ` ${firstStarter.player.name} is the first choice of ${firstStarter.firstChoiceShare}% of ` +
    `experts, and ` +
    listOf(otherStarters.map((r) => `${r.inclusionShare}% would also start ${r.player.name}`)) +
    `.`;

  return answer + why + exclusions(recommendation);
}

/**
 * The summary, as paragraphs.
 *
 * The first answers the question: who to start, on what support, and why the others are
 * out. Everything after it is context the user did not ask for and may not need, so each
 * piece gets its own paragraph rather than being run into the answer. Read as one block it
 * all looked like part of the recommendation, and the injury note in particular is not: it
 * is a fact about their week that they have to weigh themselves.
 */
function summarize(recommendation: Recommendation, isSynced: boolean): string[] {
  if (recommendation.results.length < 2) return [];

  return [
    answerParagraph(recommendation),
    goalNote(recommendation),
    isSynced ? teamNote(recommendation) : "",
  ]
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

/**
 * What the lineup goal says about the answer.
 *
 * Balanced says nothing: it applies no weight, so there is nothing to explain.
 *
 * NO CAUSAL CLAIM, DELIBERATELY. An earlier version opened with "you asked for upside, and
 * it changed the answer". The tool cannot know that. It has no idea what goal the user
 * arrived on, and someone who landed on Most Upside and stayed there changed nothing. What
 * the tool does know is the spread behind each player, so that is what it states: a fact
 * about the rankings, not a story about the user's session.
 *
 * NO COMPARISON TO BALANCED EITHER. A later version appended what Balanced would start
 * instead. Someone who has chosen Most Upside is not asking what the cautious answer would
 * have been, and offering it anyway hedges the recommendation they did ask for. The goal is
 * a question, not a suggestion to be second-guessed in its own answer.
 *
 * The numbers are the real spread: how far above his average the most optimistic expert
 * puts a player, and how far below the most pessimistic one does.
 */
function goalNote(recommendation: Recommendation): string {
  const { goal, results } = recommendation;
  if (goal === "balanced") return "";

  const spots = (value: number) => {
    const rounded = Math.round(value);
    return `${rounded} ${rounded === 1 ? "spot" : "spots"}`;
  };

  if (goal === "most-upside") {
    const widest = [...results].sort((a, b) => upsideRoom(b.player) - upsideRoom(a.player))[0];
    const room = upsideRoom(widest.player);
    if (room <= 0) return "";

    const base =
      ` Among all experts, ${widest.player.name}'s highest rank is ${spots(room)} above his ` +
      `average, giving him the most upside of these.`;
    return widest.recommended ? base : base + ` It is not enough support to take a slot.`;
  }

  const steadiest = [...results].sort((a, b) => bustRoom(a.player) - bustRoom(b.player))[0];
  const drop = bustRoom(steadiest.player);

  const base =
    ` Among all experts, ${steadiest.player.name}'s lowest rank is ${spots(drop)} below his ` +
    `average, the smallest drop of these, giving him the safest floor.`;
  return steadiest.recommended ? base : base + ` It is not enough support to take a slot.`;
}

/** Roster-aware reasoning. Synced states only, because it reads the user's team. */
function teamNote(recommendation: Recommendation): string {
  const players = recommendation.results.map((result) => result.player);
  const recommendedIds = new Set(
    recommendation.results
      .filter((result) => result.recommended)
      .map((result) => result.player.id),
  );
  const risk = availabilityRisk(players, recommendedIds);
  return risk ? availabilityNote(risk) : "";
}

/** "a, b and c", or just "a" for a single item. */
function listOf(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

const QUESTION_CHIPS: { emoji: string; ask: (name: string) => string }[] = [
  { emoji: "\u{1F911}", ask: (name) => `Is ${name} a good buy or sell candidate?` },
  { emoji: "\u{1F6A9}", ask: (name) => `How risky of a start is ${name}?` },
  { emoji: "\u{1F4C8}", ask: (name) => `Does ${name} have top-5 upside at his position?` },
];

export function ConsensusSentiment({
  recommendation,
  isSynced,
}: {
  recommendation: Recommendation;
  /** League synced. Gates the roster-aware half, which has no roster to read without it. */
  isSynced: boolean;
}) {
  const leader = recommendation.results[0];
  if (!leader || recommendation.results.length < 2) return null;

  return (
    <section className="rounded-lg bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-fp-ink">
          <span className="text-fp-blue">&#10022;</span>
          Consensus Sentiment
        </h3>
        <p className="text-xs text-fp-muted">
          powered by <span className="font-semibold text-fp-link">Coach AI</span>
        </p>
      </div>

      <div className="mt-3 rounded-md border border-fp-border bg-[#fafbfc] p-4">
        <div className="space-y-3 text-sm leading-relaxed text-fp-ink">
          {summarize(recommendation, isSynced).map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 cursor-pointer text-sm font-medium text-fp-link hover:underline"
        >
          Read Full Expert Analysis
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUESTION_CHIPS.map((chip) => (
          <button
            key={chip.ask("")}
            type="button"
            className="cursor-pointer rounded-full border border-fp-border px-3 py-1.5 text-xs text-fp-ink transition-colors hover:bg-slate-50"
          >
            <span className="mr-1.5">{chip.emoji}</span>
            {chip.ask(leader.player.name)}
          </button>
        ))}
      </div>
    </section>
  );
}
