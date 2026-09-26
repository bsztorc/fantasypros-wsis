import { buildPanel, bustRoom, upsideRoom, type Ballot } from "@/lib/ballots";
import { inSharedList, type RankedPlayer } from "@/lib/rankings";
import type { LineupGoal, StartN } from "@/lib/types";

/**
 * The recommendation engine.
 *
 * The existing tool counts, for each expert, the single player they ranked highest. That
 * answers "who is each expert's favorite". When a manager is filling two slots the
 * question changes to "who would each expert start", and the same ballots answer it
 * differently: count how often a player appears in an expert's top N.
 *
 * Nothing here re-ranks players or second-guesses the consensus. It asks a different
 * question of the same rankings.
 */

export interface PlayerResult {
  player: RankedPlayer;
  /** Experts who made this player their single first choice. */
  firstChoiceVotes: number;
  /** That as a whole-number percentage. These sum to 100 across the comparison. */
  firstChoiceShare: number;
  /** Experts who would start this player when filling N slots. */
  inclusionVotes: number;
  /** That as a whole-number percentage. These sum to roughly N x 100. */
  inclusionShare: number;
  /** Whether the engine recommends starting this player. */
  recommended: boolean;
}

export interface Recommendation {
  results: PlayerResult[];
  /** Experts who ranked every player in the comparison. */
  panelSize: number;
  startN: StartN;
  goal: LineupGoal;
  /**
   * True when the recommended set differs from a well-defined top N by first-choice share.
   *
   * This is the case the feature exists for, and the case where the current display is
   * actively misleading.
   */
  diverges: boolean;
  /**
   * True when first-choice votes tie at the selection boundary.
   *
   * A dominant favorite takes every first-place vote, leaving the remaining players on
   * nought percent each. The existing display then offers nothing to choose between them:
   * not a wrong ordering, no ordering at all. This is a stronger finding than divergence
   * and must not be reported as one, because there is no ranking here to differ from.
   */
  indistinguishable: boolean;
  /** Players the first-choice ordering would have picked, for explaining a divergence. */
  firstChoicePick: RankedPlayer[];
  /**
   * Share of experts whose own top N is exactly the recommended set.
   *
   * This is the answer to the question the user asked, on the same scale as the number the
   * product shows today. At N of 1 it returns the existing first-choice share unchanged,
   * because the existing percentage is this measure with N hardcoded to one. Across all
   * possible sets the shares total 100: one expert, one vote, as now.
   */
  combinationShare: number;
  /**
   * The set Balanced would have picked, when the chosen goal changed it.
   *
   * Null when the goal is Balanced, or when weighting for ceiling or floor lands on the
   * same players anyway. A goal that quietly alters the answer without saying so is the
   * same failure as a percentage that quietly answers a different question.
   */
  goalChangedFrom: RankedPlayer[] | null;
}

/**
 * How far a lineup goal may move a player within an expert's ranking, in board positions.
 *
 * A ballot records the rank each expert gave on the underlying board, so the nudge works
 * on that scale: at 0.35, a player whose optimistic ranking sits ten places above his
 * average gains three and a half places. That is enough to overtake someone an expert put
 * narrowly ahead of him and not enough to overtake someone put comfortably ahead.
 */
const GOAL_WEIGHT = 0.35;

/**
 * Per-player goal adjustment for one comparison, in places. Negative is better.
 *
 * Each player's ceiling or downside is measured against the widest in this comparison, so
 * the adjustment is relative to the players actually being compared rather than to the
 * whole position list. Most Upside rewards the player an optimistic expert ranks furthest
 * above his average; Safe Floor penalizes the one a pessimistic expert drops furthest.
 * Balanced applies nothing, which is why it needs no premium data.
 */
function goalAdjustments(
  players: RankedPlayer[],
  goal: LineupGoal,
): Map<string, number> {
  const empty = new Map(players.map((p) => [p.id, 0]));
  if (goal === "balanced") return empty;

  const room = (p: RankedPlayer) => (goal === "most-upside" ? upsideRoom(p) : bustRoom(p));
  const direction = goal === "most-upside" ? -1 : 1;
  return new Map(players.map((p) => [p.id, direction * GOAL_WEIGHT * room(p)]));
}

/**
 * One expert's ranking, seen through the lineup goal.
 *
 * Balanced applies nothing, so at Balanced every number on screen is a plain count of
 * what the experts said, and a single-slot comparison reproduces the product exactly.
 * Choosing Most Upside or Safe Floor declares a lens, and every figure is then computed
 * through it: the user asked what these rankings say about ceiling, so answering with
 * unweighted counts would be answering a question they did not ask.
 */
function orderBallot(
  ballot: Ballot,
  players: RankedPlayer[],
  tilt: Map<string, number>,
): RankedPlayer[] {
  return [...players].sort(
    (a, b) =>
      (ballot.get(a.id) ?? Infinity) + (tilt.get(a.id) ?? 0) -
      ((ballot.get(b.id) ?? Infinity) + (tilt.get(b.id) ?? 0)),
  );
}

function countFirstChoices(
  panel: Ballot[],
  players: RankedPlayer[],
  tilt: Map<string, number>,
): Map<string, number> {
  const votes = new Map(players.map((p) => [p.id, 0]));
  for (const ballot of panel) {
    const best = orderBallot(ballot, players, tilt)[0];
    if (best) votes.set(best.id, (votes.get(best.id) ?? 0) + 1);
  }
  return votes;
}

/** How many experts would start each player, seen through the lineup goal. */
function countInclusions(
  panel: Ballot[],
  players: RankedPlayer[],
  startN: number,
  tilt: Map<string, number>,
): Map<string, number> {
  const included = new Map(players.map((p) => [p.id, 0]));
  for (const ballot of panel) {
    for (const player of orderBallot(ballot, players, tilt).slice(0, startN)) {
      included.set(player.id, (included.get(player.id) ?? 0) + 1);
    }
  }
  return included;
}

/**
 * Run the comparison.
 *
 * Returns null when no single ranking list covers every selected player, which happens
 * when a kicker or defense is compared against anyone else. No expert ranks those
 * together, so there is no panel that can express a preference.
 */
export function recommend(
  selected: RankedPlayer[],
  startN: StartN,
  goal: LineupGoal,
): Recommendation | null {
  if (selected.length < 2) return null;

  const players = inSharedList(selected);
  if (!players) return null;

  const panel = buildPanel(players);
  const tilt = goalAdjustments(players, goal);
  const firstChoices = countFirstChoices(panel, players, tilt);
  const inclusions = countInclusions(panel, players, startN, tilt);

  const bySelection = [...players].sort((a, b) => {
    const diff = (inclusions.get(b.id) ?? 0) - (inclusions.get(a.id) ?? 0);
    return diff !== 0 ? diff : (firstChoices.get(b.id) ?? 0) - (firstChoices.get(a.id) ?? 0);
  });
  const recommended = new Set(bySelection.slice(0, startN).map((p) => p.id));

  const byFirstChoice = [...players].sort(
    (a, b) => (firstChoices.get(b.id) ?? 0) - (firstChoices.get(a.id) ?? 0),
  );
  const firstChoicePick = byFirstChoice.slice(0, startN);

  // Does the first-choice ordering actually decide the last slot, or is it a coin toss
  // between equals? Only a decided ordering can be said to diverge from anything.
  const lastIn = byFirstChoice[startN - 1];
  const firstOut = byFirstChoice[startN];
  const indistinguishable =
    firstOut !== undefined &&
    (firstChoices.get(lastIn.id) ?? 0) === (firstChoices.get(firstOut.id) ?? 0);

  const diverges = !indistinguishable && firstChoicePick.some((p) => !recommended.has(p.id));

  // How many experts would start exactly this set, rather than merely include a member.
  let exactAgreement = 0;
  for (const ballot of panel) {
    const top = orderBallot(ballot, players, tilt).slice(0, startN);
    if (top.every((p) => recommended.has(p.id))) exactAgreement += 1;
  }
  const combinationShare = Math.round((exactAgreement / panel.length) * 100);

  const results: PlayerResult[] = byFirstChoice.map((player) => ({
    player,
    firstChoiceVotes: firstChoices.get(player.id) ?? 0,
    firstChoiceShare: Math.round(((firstChoices.get(player.id) ?? 0) / panel.length) * 100),
    inclusionVotes: inclusions.get(player.id) ?? 0,
    inclusionShare: Math.round(((inclusions.get(player.id) ?? 0) / panel.length) * 100),
    recommended: recommended.has(player.id),
  }));

  // What Balanced would have chosen, so the summary can name what the goal changed.
  let goalChangedFrom: RankedPlayer[] | null = null;
  if (goal !== "balanced") {
    const balanced = recommend(selected, startN, "balanced");
    if (balanced) {
      const balancedPick = balanced.results.filter((r) => r.recommended).map((r) => r.player);
      if (balancedPick.some((p) => !recommended.has(p.id))) goalChangedFrom = balancedPick;
    }
  }

  return {
    results,
    panelSize: panel.length,
    startN,
    goal,
    diverges,
    indistinguishable,
    firstChoicePick,
    combinationShare,
    goalChangedFrom,
  };
}
