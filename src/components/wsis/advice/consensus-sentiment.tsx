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
 * Rendered only for two-player comparisons, matching the product: the summary is absent
 * once three or more players are being compared.
 */
function summarise(consensus: Consensus): string {
  const [first, second] = consensus.votes;
  if (!first || !second) return "";

  const gap = first.share - second.share;
  const strength = gap >= 30 ? "clearly prefer" : gap >= 12 ? "prefer" : "slightly prefer";
  const firstProjection = projectedPoints(first.player);
  const secondProjection = projectedPoints(second.player);
  const opponent = second.player.opponent.replace(/^(at|vs\.)\s/, "");

  const closing =
    gap < 12
      ? `The decision is close: ${first.votes} of ${consensus.totalExperts} experts made ${first.player.name} their first choice, which leaves ${consensus.totalExperts - first.votes} who did not.`
      : `${first.player.name} is the first choice of ${first.votes} of ${consensus.totalExperts} experts.`;

  return `Experts ${strength} ${first.player.name}, largely because of the projection gap (${firstProjection} vs. ${secondProjection}) against a ${opponent} matchup. ${closing}`;
}

const QUESTION_CHIPS: { emoji: string; ask: (name: string) => string }[] = [
  { emoji: "\u{1F911}", ask: (name) => `Is ${name} a good buy or sell candidate?` },
  { emoji: "\u{1F6A9}", ask: (name) => `How risky of a start is ${name}?` },
  { emoji: "\u{1F4C8}", ask: (name) => `Does ${name} have top-5 upside at his position?` },
];

export function ConsensusSentiment({ consensus }: { consensus: Consensus }) {
  const leader = consensus.votes[0];
  if (!leader) return null;

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
        <p className="text-sm leading-relaxed text-fp-ink">{summarise(consensus)}</p>
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
