import type { PlayerResult, Recommendation } from "@/lib/engine";

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
 * The summary states the answer first and then justifies the one exclusion a reader will
 * question. It quotes only expert counts, never a percentage the screen is not showing:
 * above one slot the individual shares are deliberately absent, and explaining the result
 * in terms of numbers a reader cannot see is worse than not explaining it.
 */

const COUNT_WORD = ["", "one", "two", "three", "four", "five"];

function names(results: PlayerResult[]): string {
  const list = results.map((result) => result.player.name);
  if (list.length <= 1) return list[0] ?? "";
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

/**
 * How a player's support behaves as slots open up.
 *
 * A divisive player gains almost nothing: the experts who like him already had him first,
 * and the rest have him last, so he is rarely anyone's middle pick. A dependable player
 * gains a great deal, being almost nobody's favourite and almost everybody's next choice.
 */
function gain(result: PlayerResult): number {
  return result.inclusionShare - result.firstChoiceShare;
}

function summarise(recommendation: Recommendation): string {
  const { results, panelSize, startN, combinationShare } = recommendation;
  if (results.length < 2) return "";

  const starters = results.filter((result) => result.recommended);
  const benched = results.filter((result) => !result.recommended);
  const [leader] = results;

  if (startN === 1) {
    const [, second] = results;
    const margin = leader.firstChoiceShare - second.firstChoiceShare;
    const strength = margin >= 30 ? "clearly" : margin >= 12 ? "" : "narrowly";
    return (
      `${leader.firstChoiceVotes} of ${panelSize} experts make ${leader.player.name} their ` +
      `first choice${strength ? `, ${strength} ahead of` : `, ahead of`} ${second.player.name}. ` +
      `That counts first picks only. Raise the slots you are filling and the question changes ` +
      `from who is best to who you should start.`
    );
  }

  const agreeing = Math.round((combinationShare / 100) * panelSize);
  const answer =
    `${agreeing} of ${panelSize} experts would start exactly ${names(starters)}, ` +
    `more than any other combination of these ${COUNT_WORD[results.length] ?? results.length}.`;

  if (benched.length === 0) return answer;

  // The exclusion a reader is most likely to challenge is the one with the strongest
  // showing on first-place votes, because that is the number the tool shows at one slot.
  const challenged = [...benched].sort((a, b) => b.firstChoiceShare - a.firstChoiceShare)[0];
  const dependable = [...starters].sort((a, b) => gain(b) - gain(a))[0];

  if (challenged.firstChoiceVotes === 0) {
    return (
      `${answer} ${leader.player.name} is the first pick on almost every ballot, so first ` +
      `choices alone cannot separate the rest. Counting who each expert would actually start ` +
      `does: ${dependable.player.name} appears in ${dependable.inclusionVotes} of ${panelSize} ` +
      `expert lineups, ${challenged.player.name} in ${challenged.inclusionVotes}.`
    );
  }

  if (gain(challenged) <= 8) {
    return (
      `${answer} ${challenged.player.name} is left out because opinion on him splits: ` +
      `${challenged.firstChoiceVotes} of ${panelSize} experts rank him the best of these and ` +
      `most of the rest rank him last, so he is rarely anyone's middle pick. ` +
      `${dependable.player.name} is the opposite: almost nobody's favourite, and in ` +
      `${dependable.inclusionVotes} expert lineups.`
    );
  }

  return (
    `${answer} ${challenged.player.name} is the closest alternative, in ` +
    `${challenged.inclusionVotes} of ${panelSize} expert lineups against ` +
    `${dependable.inclusionVotes} for ${dependable.player.name}.`
  );
}

const QUESTION_CHIPS: { emoji: string; ask: (name: string) => string }[] = [
  { emoji: "\u{1F911}", ask: (name) => `Is ${name} a good buy or sell candidate?` },
  { emoji: "\u{1F6A9}", ask: (name) => `How risky of a start is ${name}?` },
  { emoji: "\u{1F4C8}", ask: (name) => `Does ${name} have top-5 upside at his position?` },
];

export function ConsensusSentiment({ recommendation }: { recommendation: Recommendation }) {
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
        <p className="text-sm leading-relaxed text-fp-ink">{summarise(recommendation)}</p>
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
