import { bustRoom, upsideRoom } from "@/lib/ballots";
import { DESIGNATION_WORDING, designationFor, isRuledOut } from "@/lib/injuries";
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

/**
 * How a player's support changes as slots open up.
 *
 * A divisive player gains almost nothing: the experts who like him already had him first,
 * and the rest have him last, so he is rarely anyone's middle pick.
 */
function gain(result: PlayerResult): number {
  return result.inclusionShare - result.firstChoiceShare;
}

function summarize(recommendation: Recommendation): string {
  const { results, panelSize, startN, combinationShare } = recommendation;
  if (results.length < 2) return "";

  const starters = results.filter((result) => result.recommended);
  const benched = results.filter((result) => !result.recommended);
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
    listOf(
      otherStarters.map((r) => `${r.inclusionShare}% would also start ${r.player.name}`),
    ) +
    `.`;

  if (benched.length === 0) return answer + why + goalNote(recommendation) + availabilityNote(recommendation);

  const challenged = [...benched].sort((a, b) => b.firstChoiceShare - a.firstChoiceShare)[0];

  // A divisive player is the interesting exclusion: he looks like the obvious next pick on
  // first-place votes alone, and is the reason the two questions give different answers.
  if (gain(challenged) <= 8 && challenged.firstChoiceShare > 0) {
    return (
      answer +
      why +
      ` ${challenged.player.name} divides opinion: ${challenged.firstChoiceShare}% rank him ` +
      `the best of these, but most of the rest rank him last.` +
      goalNote(recommendation) +
      availabilityNote(recommendation)
    );
  }

  return answer + why + goalNote(recommendation) + availabilityNote(recommendation);
}

/**
 * What the lineup goal did to the answer.
 *
 * Balanced says nothing: it applies no weight, so there is nothing to explain. The other
 * two do change the selection, and a control that silently alters the recommendation is
 * the same problem as a percentage that silently answers a different question.
 *
 * The numbers are the real spread behind each player: how far above his average the most
 * optimistic expert puts him, and how far below the most pessimistic one does.
 */
function goalNote(recommendation: Recommendation): string {
  const { goal, goalChangedFrom, results } = recommendation;
  if (goal === "balanced") return "";

  const starters = results.filter((r) => r.recommended);
  const spots = (value: number) => {
    const rounded = Math.round(value);
    return `${rounded} ${rounded === 1 ? "spot" : "spots"}`;
  };

  if (goal === "most-upside") {
    if (goalChangedFrom) {
      const added = starters.find((r) => !goalChangedFrom.some((p) => p.id === r.player.id));
      const dropped = goalChangedFrom.find((p) => !starters.some((r) => r.player.id === p.id));
      if (added && dropped) {
        return (
          ` Most Upside puts ${added.player.name} in ahead of ${dropped.name}: his best expert ` +
          `ranking is ${spots(upsideRoom(added.player))} above his average, the widest ceiling here.`
        );
      }
    }
    const widest = [...results].sort((a, b) => upsideRoom(b.player) - upsideRoom(a.player))[0];
    return widest.recommended
      ? ` Most Upside does not change the pick: ${widest.player.name} already has the widest ceiling here.`
      : ` Most Upside does not change the pick. ${widest.player.name} has the widest ceiling here, but not enough to displace ${starters[starters.length - 1].player.name}.`;
  }

  if (goalChangedFrom) {
    const added = starters.find((r) => !goalChangedFrom.some((p) => p.id === r.player.id));
    const dropped = goalChangedFrom.find((p) => !starters.some((r) => r.player.id === p.id));
    if (added && dropped) {
      return (
        ` Safe Floor puts ${added.player.name} in ahead of ${dropped.name}: ${dropped.name}'s worst ` +
        `expert ranking is ${spots(bustRoom(dropped))} below his average, the steepest drop here.`
      );
    }
  }
  const steadiest = [...results].sort((a, b) => bustRoom(a.player) - bustRoom(b.player))[0];
  return steadiest.recommended
    ? ` Safe Floor does not change the pick: ${steadiest.player.name} already has the least downside here.`
    : ` Safe Floor does not change the pick. ${steadiest.player.name} has the least downside here, but not enough to displace ${starters[starters.length - 1].player.name}.`;
}

/**
 * Availability, when a recommended player carries a designation.
 *
 * Injury uncertainty is the single most common thing users add when they ask for start
 * advice, so a recommendation that ignores it answers a narrower question than the one
 * being asked.
 *
 * What this will not do is predict. A questionable or doubtful player's status usually
 * resolves through the week's practice reports, and the prototype does not hold those, so
 * it reports the designation and stops. Guessing at a likelihood would be inventing the
 * very context the user came looking for. Out, injured reserve, PUP and suspended need no
 * hedging: those players are not playing.
 */
function availabilityNote(recommendation: Recommendation): string {
  const flagged = recommendation.results
    .filter((r) => r.recommended)
    .map((r) => ({ result: r, designation: designationFor(r.player.id) }))
    .filter((entry) => entry.designation !== null);

  if (flagged.length === 0) return "";

  const ruledOut = flagged.filter((entry) => isRuledOut(entry.designation!));
  if (ruledOut.length > 0) {
    const names = listOf(ruledOut.map((entry) => `${entry.result.player.name} is ${DESIGNATION_WORDING[entry.designation!]}`));
    return ` ${names}, so the rankings behind this do not reflect a player who will not take the field.`;
  }

  const names = listOf(
    flagged.map((entry) => `${entry.result.player.name} is ${DESIGNATION_WORDING[entry.designation!]}`),
  );
  return ` ${names}. That is not resolved yet, and this recommendation does not account for whether he plays.`;
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
        <p className="text-sm leading-relaxed text-fp-ink">{summarize(recommendation)}</p>
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
