import { seeded } from "@/lib/seed";
import type { Player, Position } from "@/lib/types";

/**
 * Expert consensus for a comparison.
 *
 * IMPORTANT: this is not FantasyPros' algorithm. It is a deterministic stand-in so the
 * prototype computes its percentages instead of hardcoding them, and so the arithmetic
 * behaves the way the real product's does: whole expert votes that sum to the pool, and
 * percentages rounded independently.
 */
export interface ExpertVote {
  player: Player;
  /** Experts whose first choice is this player. */
  votes: number;
  /** Share of the expert pool, rounded to a whole number. */
  share: number;
}

export interface Consensus {
  /** Experts who ranked every player in this comparison. */
  totalExperts: number;
  /** Highest share first. */
  votes: ExpertVote[];
}

/** Per-position scoring curve used to derive a projection from a consensus rank. */
const POSITION_CURVE: Record<Position, { top: number; decay: number }> = {
  QB: { top: 21.5, decay: 2.6 },
  RB: { top: 19.0, decay: 3.1 },
  WR: { top: 18.5, decay: 3.0 },
  TE: { top: 14.0, decay: 2.8 },
  K: { top: 9.5, decay: 1.4 },
  DST: { top: 9.0, decay: 1.6 },
};

/** The numeric part of a consensus rank, e.g. "WR13" gives 13. */
export function rankNumber(player: Player): number {
  const digits = player.rank.replace(/\D/g, "");
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/**
 * Projected fantasy points, derived from the player's positional rank.
 *
 * Illustrative only. Real projections come from the expert pool, not from rank.
 */
export function projectedPoints(player: Player): number {
  const { top, decay } = POSITION_CURVE[player.position];
  const projection = top - decay * Math.log(rankNumber(player));
  return Math.round(Math.max(projection, 1.5) * 10) / 10;
}

/** Experts contributing when every player shares a position. */
export const BASE_EXPERT_POOL = 45;

/**
 * Experts who ranked every player in the comparison.
 *
 * The pool is not fixed. Only experts who ranked all of the players can express a first
 * choice between them, so mixing positions shrinks it. Observed in the product: three
 * running backs draw 45 experts, while swapping one for a wide receiver drops it to 42.
 *
 * This matters beyond display. Expert count caps how strong a consensus can legitimately
 * be called, regardless of how lopsided the vote looks.
 */
export function expertPoolFor(players: Player[]): number {
  const positions = new Set(players.map((player) => player.position));
  return Math.max(BASE_EXPERT_POOL - 3 * (positions.size - 1), 12);
}

/**
 * Allocate whole expert votes across the players in a comparison.
 *
 * Uses the largest remainder method so votes sum exactly to the pool. Percentages are
 * then rounded per player, which is what the real product does, and is why three or four
 * displayed shares do not always total exactly 100.
 */
export function computeConsensus(players: Player[], totalExperts?: number): Consensus {
  const pool = totalExperts ?? expertPoolFor(players);
  if (players.length === 0) return { totalExperts: pool, votes: [] };

  // Sharpen the projection gap so a clear favourite reads as one.
  const weights = players.map((player) => Math.pow(projectedPoints(player), 4));
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);

  const exact = weights.map((weight) => (weight / weightTotal) * pool);
  const floors = exact.map(Math.floor);
  let remaining = pool - floors.reduce((sum, value) => sum + value, 0);

  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);

  const allocated = [...floors];
  for (const entry of byRemainder) {
    if (remaining <= 0) break;
    allocated[entry.index] += 1;
    remaining -= 1;
  }

  const votes: ExpertVote[] = players.map((player, index) => ({
    player,
    votes: allocated[index],
    share: Math.round((allocated[index] / pool) * 100),
  }));

  return { totalExperts: pool, votes: votes.sort((a, b) => b.votes - a.votes) };
}

/**
 * First-choice shares within a subset of the expert pool, such as the most accurate
 * experts overall or at the player's position.
 *
 * Each subset perturbs the weights slightly, so a subset can disagree with the headline
 * number. That is not an artefact: it is visible in the product, where the most accurate
 * experts can prefer a different player than the full pool does. It is also the clearest
 * argument that a single percentage is a summary of votes rather than a verdict.
 *
 * Illustrative, like the rest of the fixture model.
 */
export function subsetShares(players: Player[], salt: number, subsetSize: number): number[] {
  if (players.length === 0) return [];

  const weights = players.map(
    (player) => Math.pow(projectedPoints(player), 4) * (0.55 + seeded(player.id, salt) * 1.1),
  );
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);

  const exact = weights.map((weight) => (weight / weightTotal) * subsetSize);
  const floors = exact.map(Math.floor);
  let remaining = subsetSize - floors.reduce((sum, value) => sum + value, 0);

  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);

  const allocated = [...floors];
  for (const entry of byRemainder) {
    if (remaining <= 0) break;
    allocated[entry.index] += 1;
    remaining -= 1;
  }

  return allocated.map((votes) => Math.round((votes / subsetSize) * 100));
}
