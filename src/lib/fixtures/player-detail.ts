import { projectedPoints, rankNumber } from "@/lib/consensus";
import type { Player } from "@/lib/types";

/**
 * Per-player detail for the advice view.
 *
 * Every value here is derived from the player's fixture rank so the prototype is
 * deterministic and internally consistent. None of it is live data, and the derivations
 * are illustrative rather than an attempt to reproduce FantasyPros' models.
 */

/** Stable pseudo-random number in [0, 1) from a player id. Same id, same value, always. */
function seeded(id: string, salt: number): number {
  let hash = salt;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return (hash % 1000) / 1000;
}

/** Matchup difficulty, 1 (hardest) to 5 (easiest). */
export function matchupRating(player: Player): number {
  return 1 + Math.floor(seeded(player.id, 7) * 5);
}

export interface DefenseAllowed {
  attempts: number;
  yards: number;
  touchdowns: number;
}

/** What the opponent defence has been giving up. */
export function defenseAllowed(player: Player): DefenseAllowed {
  const rating = matchupRating(player);
  return {
    attempts: Math.round(20 + rating * 2.4 + seeded(player.id, 11) * 4),
    yards: Math.round(70 + rating * 14 + seeded(player.id, 13) * 25),
    touchdowns: Math.round(seeded(player.id, 17) * rating * 0.6),
  };
}

export interface SeasonStats {
  seasonTotal: number;
  seasonAverage: number;
  projectionAverage: number;
  priorYearAverage: number;
}

/** Season-to-date production, anchored to the player's projection. */
export function seasonStats(player: Player): SeasonStats {
  const projection = projectedPoints(player);
  const variance = 0.75 + seeded(player.id, 23) * 0.6;
  const seasonAverage = Math.round(projection * variance * 10) / 10;
  return {
    seasonTotal: Math.round(seasonAverage * 2 * 10) / 10,
    seasonAverage,
    projectionAverage: projection,
    priorYearAverage: Math.round(projection * (0.6 + seeded(player.id, 29) * 0.7) * 10) / 10,
  };
}

/** Kickoff weather, in Fahrenheit. */
export function weather(player: Player): number {
  return Math.round(52 + seeded(player.id, 31) * 26);
}

/**
 * Availability, the concern users raise most often in start/sit questions.
 *
 * Deliberately not random: a couple of fixture players are marked questionable so the
 * reasoning has something real to work with in a later iteration.
 */
const QUESTIONABLE = new Set(["godwin", "kamara", "tp-hubbard"]);

export function injuryStatus(player: Player): "Healthy" | "Questionable" {
  return QUESTIONABLE.has(player.id) ? "Questionable" : "Healthy";
}

/** Consensus rank as a plain number, re-exported for display. */
export { rankNumber };

/**
 * Sentiment meters, each 1 to 5.
 *
 * Deliberately not derived from vote share. In the product a player can lead the expert
 * vote and still carry a Low overall sentiment, so tying these to the percentage would
 * misrepresent how they behave.
 */
export function sentimentOverall(player: Player): number {
  return 1 + Math.floor(seeded(player.id, 41) * 5);
}

export function sentimentUpside(player: Player): number {
  return 1 + Math.floor(seeded(player.id, 43) * 5);
}

export function sentimentBust(player: Player): number {
  return 1 + Math.floor(seeded(player.id, 47) * 5);
}
