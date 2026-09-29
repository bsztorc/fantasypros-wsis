import { bustRoom, upsideRoom } from "@/lib/expert-rankings";
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
 * The two players the last slot was decided between, when the votes could not decide it.
 *
 * The engine picks by inclusion votes, falls back to first-choice votes, and ends on a
 * canonical comparison by name so that the same set of players always returns the same
 * answer. When both counts are level at the selection boundary, that name comparison is what
 * awarded the slot. Saying one player is "ahead of" or "trails" the other would then be
 * describing a margin that does not exist, which is the same failure this whole summary
 * exists to avoid. Null whenever the votes did separate them, which is nearly always.
 */
function tieBreak(
  recommendation: Recommendation,
): { winner: PlayerResult; loser: PlayerResult } | null {
  const starters = recommendation.results.filter((result) => result.recommended);
  const benched = recommendation.results.filter((result) => !result.recommended);
  if (starters.length === 0 || benched.length === 0) return null;

  const bySupport = (a: PlayerResult, b: PlayerResult) =>
    b.inclusionVotes - a.inclusionVotes || b.firstChoiceVotes - a.firstChoiceVotes;

  const weakestStarter = [...starters].sort(bySupport)[starters.length - 1];
  const strongestBenched = [...benched].sort(bySupport)[0];

  return weakestStarter.inclusionVotes === strongestBenched.inclusionVotes &&
    weakestStarter.firstChoiceVotes === strongestBenched.firstChoiceVotes
    ? { winner: weakestStarter, loser: strongestBenched }
    : null;
}

/**
 * Why one player did not make the lineup.
 *
 * Every excluded player gets a reason. Leaving that to the reader is what the current display
 * does: it shows an ordering, says nothing about what the ordering means, and lets them infer
 * that second place is the next best start.
 *
 * NOTHING HERE SAYS ANYONE WOULD START A PLAYER WHO IS NOT BEING STARTED. These sentences
 * exist to say why a player is out, and "while 52% would still start him" argues against the
 * recommendation it is supposed to be explaining. Put as ranking rather than as starting, the
 * same fact reads as the reason it is: not enough experts put him high enough.
 *
 * COUNTS, NOT PERCENTAGES. Inclusion counts experts whose own top N includes a player, so
 * across a comparison these sum to N x 100 rather than 100. At two slots the average player
 * sits near 67% of three or 50% of four, and that par moves with the number of players
 * compared, so a bare percentage lands on a scale the reader cannot see and lands differently
 * from one comparison to the next. "19 of 46 experts" does not.
 *
 * NO THRESHOLDS. Two invented numbers used to live here: a 40% share above which "only" was
 * withheld, and a 10 point margin below which a shortfall became "the closest call". Both
 * were dodges around percentages that read wrong on their own. A player who trails trails,
 * and how narrowly is not the reason he is out.
 */
function whyNotStarted(
  result: PlayerResult,
  weakestStarter: PlayerResult | undefined,
  tiedWith: PlayerResult | undefined,
  startN: number,
): string {
  const name = result.player.name;
  const topN = `their top ${COUNT_WORD[startN] ?? startN}`;

  // A tie is not a narrow loss and must not be described as one. The reader is entitled to
  // know the vote did not decide this, without being walked through how the tie was settled.
  if (tiedWith) {
    return `${name} is level with ${tiedWith.player.name} and loses the last spot on a tie-break`;
  }

  if (result.inclusionVotes === 0) {
    return `no expert ranks ${name} in ${topN}`;
  }

  if (result.firstChoiceVotes === 0) {
    // Nobody's favourite is a real position and not a verdict on the player, so this branch
    // carries no count at all. He is out because fewer experts rank him high enough, and
    // that is the whole of it.
    return weakestStarter
      ? `nobody ranks ${name} the best of these, and fewer experts put him in ${topN} than ` +
          `${weakestStarter.player.name}`
      : `nobody ranks ${name} the best of these`;
  }

  // A divisive player is the interesting exclusion: he looks like the obvious next pick on
  // first-place votes alone, and is the reason the two questions give different answers.
  if (gain(result) <= 8) {
    return (
      `${name} splits the panel: ${result.firstChoiceVotes} experts rank him the best of ` +
      `these, and most of the rest rank him last`
    );
  }

  if (!weakestStarter) {
    return `${name} trails: ${result.inclusionVotes} experts put him in ${topN}`;
  }

  // Both counts, so the shortfall is visible rather than asserted, and the reader never has
  // to know what a good inclusion number looks like to read it.
  return (
    `${name} trails: ${result.inclusionVotes} experts put him in ${topN}, against ` +
    `${weakestStarter.inclusionVotes} for ${weakestStarter.player.name}`
  );
}

/**
 * One sentence per excluded player, and no lead-in.
 *
 * "The one left out:" and "The others:" announced a structure the sentences did not need. A
 * reader filling two slots from four players can see which players are missing from the
 * recommendation without being told there are some.
 *
 * ONE RULE, NOT TWO, AND THE PLURAL IS THE REASON. Dropping only the singular lead-in left
 * the plural as a colon-introduced list, which forced the reasons through `listOf` and joined
 * them with "and". The reasons are not noun phrases: four of the seven branches carry their
 * own comma, colon or "and" already, so the join produced a run-on with no boundary between
 * one player's reason and the next:
 *
 *   The others: nobody ranks D. London the best of these, and only 26% would start him over
 *   the others and no expert would start M. Wilson over these.
 *
 * Two "and"s, "the others" twice, and nothing to say where London ends and Wilson begins.
 * Sentences need no separator, so giving every exclusion its own removes the list, the join
 * and the duplicated phrase at once. Only reachable at four players and two slots, because
 * one slot never calls this and every other shape leaves exactly one player out.
 */
function exclusions(recommendation: Recommendation): string {
  const starters = recommendation.results.filter((result) => result.recommended);
  const benched = recommendation.results.filter((result) => !result.recommended);
  if (benched.length === 0) return "";

  const weakestStarter = [...starters].sort((a, b) => a.inclusionShare - b.inclusionShare)[0];
  const tie = tieBreak(recommendation);

  const reasons = [...benched]
    .sort((a, b) => b.inclusionShare - a.inclusionShare)
    .map((result) =>
      whyNotStarted(
        result,
        weakestStarter,
        tie && tie.loser.player.id === result.player.id ? tie.winner : undefined,
        recommendation.startN,
      ),
    );

  return reasons
    .map((reason) => ` ${reason.charAt(0).toUpperCase()}${reason.slice(1)}.`)
    .join("");
}

/** The recommendation and the expert support behind it. Answers the question asked. */
function answerParagraph(recommendation: Recommendation): string {
  const { results, panelSize, startN, combinationShare } = recommendation;
  const starters = results.filter((result) => result.recommended);
  const [leader] = results;

  if (startN === 1) {
    const rest = results.slice(1);

    // A runaway favorite takes every vote and leaves the rest on nought. Say that plainly.
    //
    // This sentence used to carry a second half, that the percentage says nothing about
    // which of them to start next to him. True, and not an answer to the question asked: at
    // one slot the user wants one player, and arguing for the feature inside the answer to a
    // question they did not ask is the tool talking about itself. Counted on votes rather
    // than on the rounded share, so a fractional share can never round down into this claim.
    if (rest.every((result) => result.firstChoiceVotes === 0)) {
      const others = rest.length === 1 ? "the other" : "the others";
      return (
        `All ${panelSize} experts make ${leader.player.name} their first choice. Nobody ` +
        `ranked ${others} above him.`
      );
    }

    // Two players level on first-choice votes is the one case where "ahead of" is a lie. At
    // one slot the vote is the whole answer, so when it does not separate them the summary
    // has to say so and name what awarded the slot instead.
    const level = rest.filter(
      (result) => result.firstChoiceVotes === leader.firstChoiceVotes,
    );

    if (level.length > 0) {
      const behind = rest.filter((result) => !level.includes(result));
      const shared = listOf(
        level.map((result) => `${result.firstChoiceVotes} make ${result.player.name} theirs`),
      );
      const others =
        behind.length > 0
          ? `, with ` +
            listOf(behind.map((result) => `${result.player.name} at ${result.firstChoiceShare}%`))
          : ``;

      return (
        `${leader.firstChoiceVotes} of ${panelSize} experts make ${leader.player.name} their ` +
        `first choice and ${shared}${others}. ${leader.player.name} takes the recommendation ` +
        `on a tie-break.`
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
 * It explains the recommendation and nothing else: who to start, on what support, why the
 * others are out, and what the lineup goal contributes when one is set.
 *
 * NO ROSTER REASONING. A version of this carried a third paragraph about injury
 * designations and kickoff times for synced users. It was cut deliberately. Those facts are
 * already available to the product's own AI summary, so narrating them here adds nothing a
 * prompt could not: it changed what the tool said rather than what the tool computed. Start
 * N changes what is computed, which is why it is the idea this prototype is built on.
 */
function summarize(recommendation: Recommendation): string[] {
  if (recommendation.results.length < 2) return [];

  return [answerParagraph(recommendation), goalNote(recommendation)]
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
/**
 * What a spread is not enough for.
 *
 * Says what the shortfall is against, which "not enough according to experts" did not: the
 * player has the best floor or the best ceiling of the group and still did not make the
 * lineup. It is the slot he missed, not the measure.
 */
const SHORT_OF_A_START = ", but not enough to earn a start over the other options.";

function goalNote(recommendation: Recommendation): string {
  const { goal, results, startN } = recommendation;
  if (goal === "balanced") return "";

  const spots = (value: number) => {
    const rounded = Math.round(value);
    return `${rounded} ${rounded === 1 ? "spot" : "spots"}`;
  };

  const upside = goal === "most-upside";
  const room = (result: PlayerResult) =>
    upside ? upsideRoom(result.player) : bustRoom(result.player);

  // Best on this measure first: the widest ceiling for upside, the smallest drop for floor.
  const byMeasure = [...results].sort((a, b) => (upside ? room(b) - room(a) : room(a) - room(b)));

  if (upside && room(byMeasure[0]) <= 0) return "";

  if (startN === 1) {
    const best = byMeasure[0];
    const lead = upside
      ? `Among all experts, ${best.player.name}'s highest rank is ${spots(room(best))} above ` +
        `his average, giving him the most upside of these`
      : `Among all experts, ${best.player.name}'s lowest rank is ${spots(room(best))} below ` +
        `his average, the smallest drop of these, giving him the safest floor`;

    if (best.recommended) return `${lead}.`;

    // He did not fall short of anything. The vote was level and the tie-break went to the
    // other player, which the paragraph above has already said, so the note has to agree
    // with it rather than offer a second, contradictory reason for the same exclusion.
    const tie = tieBreak(recommendation);
    if (tie && tie.loser.player.id === best.player.id) {
      return `${lead}, and the slot went the other way on the tie-break.`;
    }

    return lead + SHORT_OF_A_START;
  }

  // ABOVE ONE SLOT THE ANSWER IS A SET, SO THE NOTE HAS TO ACCOUNT FOR ALL OF IT.
  //
  // This sentence used to name only the group's best on the measure and stop. At one slot
  // that is the whole answer. Above one slot it left the second recommended player
  // unexplained: the reader has been handed a pair and told why one of them is there, which
  // invites exactly the inference the results band was redesigned to prevent, that the two
  // tiles are a first pick and a runner-up.
  const starters = results.filter((result) => result.recommended);

  // EVERY COMPARISON BELOW RUNS ON THE ROUNDED FIGURE, NOT THE RAW SPREAD.
  //
  // The sentence prints whole spots, so a claim settled on the hundredths behind them
  // contradicts the numbers beside it. An earlier version did exactly that and produced
  // "G. Pickens's highest rank is 3 spots above his average. D. London's ceiling is wider
  // still at 3 spots", which is the tool arguing with its own output.
  const measure = (result: PlayerResult) => Math.round(room(result));
  const better = (a: PlayerResult, b: PlayerResult) =>
    upside ? measure(a) > measure(b) : measure(a) < measure(b);

  const full = (result: PlayerResult) => {
    if (measure(result) === 0) {
      return upside
        ? `${result.player.name} has no room above his average`
        : `${result.player.name} has no drop below his average`;
    }
    return upside
      ? `${result.player.name}'s highest rank is ${spots(room(result))} above his average`
      : `${result.player.name}'s lowest rank is ${spots(room(result))} below his average`;
  };

  // The second and third readings drop the scaffolding. Repeating "highest rank is N spots
  // above his average" for every player buries the numbers the sentence exists to compare.
  const short = (result: PlayerResult) =>
    measure(result) === 0
      ? `${result.player.name}'s is none`
      : `${result.player.name}'s is ${spots(room(result))}`;

  const [first, ...rest] = starters;
  const lead = `Among all experts, ${listOf([full(first), ...rest.map(short)])}.`;
  const group = starters.length === 2 ? "pair" : "group";

  // NO CLAIM THAT THE SET IS BEST ON THE MEASURE, BECAUSE IT NEED NOT BE. The goal tilts
  // every expert's ranking and the lineup is then chosen on votes, so a player can carry the
  // better spread and still not be started. Naming him, and naming the starter he beats, is
  // the honest version and the same admission the one-slot sentence already makes.
  // Worst on the measure first, so index 0 is the starter a left-out player has to beat.
  const weakest = [...starters].sort((a, b) => (better(a, b) ? 1 : better(b, a) ? -1 : 0))[0];
  const challenger = results
    .filter((result) => !result.recommended)
    .sort((a, b) => (better(a, b) ? -1 : better(b, a) ? 1 : 0))[0];

  // THE CLAIM IS ABOUT THE SET, NOT ABOUT WHO IS MISSING FROM IT.
  //
  // Two earlier versions phrased this as an absence: "nobody left out has a wider ceiling",
  // then "no one else here has more room above his average". Both were true and both read as
  // though nobody had been left out at all, which is never the case. Start N only unlocks
  // once there are more players than slots, so every recommendation excludes someone, and a
  // sentence a reader can take as saying otherwise contradicts the screen it sits under.
  //
  // Stated as a property of the recommended set it needs no reference to the excluded players
  // at all, and it is the stronger claim: the condition checked here is that no excluded
  // player beats the weakest starter, which means no other combination of these players
  // scores higher on the measure either.
  const count = COUNT_WORD[results.length] ?? results.length;

  if (!challenger || !better(challenger, weakest)) {
    return upside
      ? `${lead} No other ${group} from these ${count} has more.`
      : `${lead} No other ${group} from these ${count} drops less.`;
  }

  // Both figures, in the same words as the sentence before it. "X's ceiling is wider than
  // Y's at 6 spots" made the reader work out which player the 6 belonged to and hold the
  // other number from the previous sentence to see the gap. Printing the pair settles it.
  const gap = `${Math.round(room(challenger))} spots against ${Math.round(room(weakest))}`;

  return (
    `${lead} ${challenger.player.name} has ` +
    `${upside ? "more room above his average" : "a smaller drop below his average"} than ` +
    `${weakest.player.name}, ${gap}` +
    SHORT_OF_A_START
  );
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
        <div className="space-y-3 text-sm leading-relaxed text-fp-ink">
          {summarize(recommendation).map((paragraph) => (
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
