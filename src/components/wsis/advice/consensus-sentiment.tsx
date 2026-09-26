import type { Recommendation } from "@/lib/engine";

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
 */
function summarise(recommendation: Recommendation): string {
  const { results, panelSize, startN } = recommendation;
  const [first, second] = results;
  if (!first || !second) return "";

  if (startN === 1) {
    const gap = first.firstChoiceShare - second.firstChoiceShare;
    const strength = gap >= 30 ? "clearly prefer" : gap >= 12 ? "prefer" : "slightly prefer";
    return (
      `Experts ${strength} ${first.player.name}. That is a first-choice vote, not a verdict: ` +
      `${first.firstChoiceVotes} of ${panelSize} experts picked him, and ` +
      `${panelSize - first.firstChoiceVotes} picked someone else.`
    );
  }

  const picks = results.filter((r) => r.recommended);
  const left = results.filter((r) => !r.recommended);
  const names = picks.map((r) => r.player.name);
  const pairing = names.length === 2 ? names.join(" and ") : names.join(", ");

  if (recommendation.indistinguishable) {
    const zeros = left.filter((r) => r.firstChoiceShare === 0).map((r) => r.player.name);
    return (
      `${first.player.name} takes every first-place vote, so ${zeros.join(" and ")} both show 0%. ` +
      `That percentage counts first choices only, and neither was anyone's first choice. ` +
      `Counting who each expert would actually start in ${startN} slots puts ${pairing} together, ` +
      `which ${recommendation.combinationShare}% of the panel would do.`
    );
  }

  const strongest = left.sort((a, b) => b.firstChoiceShare - a.firstChoiceShare)[0];

  if (recommendation.diverges && strongest) {
    const lastPick = picks[picks.length - 1];
    return (
      `${recommendation.combinationShare}% of experts would start ${pairing}, more than any other ` +
      `combination. On first-place votes alone ${strongest.player.name} looks like the better ` +
      `second option: ${strongest.firstChoiceVotes} of ${panelSize} experts rank him best of these. ` +
      `Most of the rest rank him last, so he is rarely anyone's second choice. ` +
      `${lastPick.player.name} is nobody's favourite and almost everybody's acceptable second.`
    );
  }

  return (
    `${recommendation.combinationShare}% of experts would start ${pairing}, more than any other ` +
    `combination of these ${results.length}. ${first.player.name} leads the first-place vote at ` +
    `${first.firstChoiceShare}%, and the pairing holds when you count who each expert would ` +
    `actually start rather than who they would pick first.`
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
