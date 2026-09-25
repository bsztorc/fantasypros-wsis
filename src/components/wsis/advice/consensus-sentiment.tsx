import { projectedPoints } from "@/lib/consensus";
import type { Consensus } from "@/lib/consensus";

/**
 * Stub of the product's existing Coach AI summary.
 *
 * The numbers are real, in that they are computed from the same fixture model as the rest
 * of the view. The prose around them is templated rather than generated. Rebuilding Coach
 * AI is explicitly not the point of this prototype, and a fake model call would be worse
 * than an honest template.
 *
 * DELIBERATE DIVERGENCE FROM THE PRODUCT: the live tool shows this summary at two players
 * and drops it at three or more. That is backwards. The comparison gets harder as players
 * are added, the gap between the headline percentage and the supporting data widens, and
 * the explanation is withdrawn at the point it is most needed. Here it always renders.
 */
function summariseHeadToHead(consensus: Consensus): string {
  const [first, second] = consensus.votes;
  const gap = first.share - second.share;
  const strength = gap >= 30 ? "clearly prefer" : gap >= 12 ? "prefer" : "slightly prefer";
  const dissenting = consensus.totalExperts - first.votes;

  return (
    `Experts ${strength} ${first.player.name}, largely on projection ` +
    `(${projectedPoints(first.player)} vs. ${projectedPoints(second.player)}) and matchup. ` +
    `That is a first-choice vote, not a verdict: ${first.votes} of ${consensus.totalExperts} ` +
    `experts picked him, and ${dissenting} picked someone else.`
  );
}

function summariseMultiPlayer(consensus: Consensus): string {
  const [first, second] = consensus.votes;
  const split = consensus.votes.map((vote) => `${vote.share}%`).join(" / ");

  return (
    `The vote splits ${split} across ${consensus.votes.length} players, and ` +
    `${first.votes} of ${consensus.totalExperts} experts made ${first.player.name} their ` +
    `first choice. Each percentage counts first-place votes only, so ${second.player.name} ` +
    `at ${second.share}% is the second most-picked winner. That is not the same as the ` +
    `player experts would start alongside ${first.player.name}.`
  );
}

const QUESTION_CHIPS: { emoji: string; ask: (name: string) => string }[] = [
  { emoji: "\u{1F911}", ask: (name) => `Is ${name} a good buy or sell candidate?` },
  { emoji: "\u{1F6A9}", ask: (name) => `How risky of a start is ${name}?` },
  { emoji: "\u{1F4C8}", ask: (name) => `Does ${name} have top-5 upside at his position?` },
];

export function ConsensusSentiment({ consensus }: { consensus: Consensus }) {
  const leader = consensus.votes[0];
  if (!leader || consensus.votes.length < 2) return null;

  const summary =
    consensus.votes.length === 2
      ? summariseHeadToHead(consensus)
      : summariseMultiPlayer(consensus);

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
        <p className="text-sm leading-relaxed text-fp-ink">{summary}</p>
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
