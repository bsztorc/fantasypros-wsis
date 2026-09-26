import { buildPanel, bustRoom, upsideRoom, type Ballot } from "@/lib/ballots";
import { inSharedList, type RankedPlayer } from "@/lib/rankings";
import type { LineupGoal, StartN } from "@/lib/types";

/**
 * The recommendation engine.
 *
 * The existing tool counts, for each expert, the single player they ranked highest. That
 * answers "who is each expert's favourite". When a manager is filling two slots the
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
   * A dominant favourite takes every first-place vote, leaving the remaining players on
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
}

/** How far a lineup goal is allowed to move a player's standing, in rank positions. */
const GOAL_WEIGHT = 0.35;

/**
 * Goal adjustment, in rank positions. Negative is better.
 *
 * Most Upside rewards the player an optimistic expert would rank far higher than the
 * average; Safe Floor penalises the one a pessimistic expert would drop furthest. Balanced
 * applies nothing, which is why it needs no premium data and stays available to everyone.
 */
function goalAdjustment(player: RankedPlayer, goal: LineupGoal): number {
  if (goal === "most-upside") return -GOAL_WEIGHT * upsideRoom(player);
  if (goal === "safe-floor") return GOAL_WEIGHT * bustRoom(player);
  return 0;
}

function countFirstChoices(panel: Ballot[], ids: string[]): Map<string, number> {
  const votes = new Map(ids.map((id) => [id, 0]));
  for (const ballot of panel) {
    let best: string | null = null;
    for (const id of ids) {
      if (best === null || (ballot.get(id) ?? Infinity) < (ballot.get(best) ?? Infinity)) best = id;
    }
    if (best) votes.set(best, (votes.get(best) ?? 0) + 1);
  }
  return votes;
}

function countInclusions(
  panel: Ballot[],
  players: RankedPlayer[],
  startN: number,
  goal: LineupGoal,
): Map<string, number> {
  const included = new Map(players.map((p) => [p.id, 0]));
  for (const ballot of panel) {
    const ordered = [...players].sort(
      (a, b) =>
        (ballot.get(a.id) ?? Infinity) + goalAdjustment(a, goal) -
        ((ballot.get(b.id) ?? Infinity) + goalAdjustment(b, goal)),
    );
    for (const player of ordered.slice(0, startN)) {
      included.set(player.id, (included.get(player.id) ?? 0) + 1);
    }
  }
  return included;
}

/**
 * Run the comparison.
 *
 * Returns null when no single ranking list covers every selected player, which happens
 * when a kicker or defence is compared against anyone else. No expert ranks those
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

  const ids = players.map((p) => p.id);
  const panel = buildPanel(players);
  const firstChoices = countFirstChoices(panel, ids);
  const inclusions = countInclusions(panel, players, startN, goal);

  const byInclusion = [...players].sort((a, b) => {
    const diff = (inclusions.get(b.id) ?? 0) - (inclusions.get(a.id) ?? 0);
    return diff !== 0 ? diff : (firstChoices.get(b.id) ?? 0) - (firstChoices.get(a.id) ?? 0);
  });
  const recommended = new Set(byInclusion.slice(0, startN).map((p) => p.id));

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
    const top = [...players]
      .sort(
        (a, b) =>
          (ballot.get(a.id) ?? Infinity) + goalAdjustment(a, goal) -
          ((ballot.get(b.id) ?? Infinity) + goalAdjustment(b, goal)),
      )
      .slice(0, startN);
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

  return {
    results,
    panelSize: panel.length,
    startN,
    goal,
    diverges,
    indistinguishable,
    firstChoicePick,
    combinationShare,
  };
}
