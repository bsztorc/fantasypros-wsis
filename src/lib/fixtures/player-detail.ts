import { bustRoom, upsideRoom } from "@/lib/expert-rankings";
import type { SentimentLevel } from "@/components/wsis/advice/sentiment-meter";
import { DESIGNATION_WORDING, designationFor } from "@/lib/injuries";
import { seeded } from "@/lib/seed";
import type { Player } from "@/lib/types";

/**
 * Supporting detail for the advice view.
 *
 * Some of this is real and some is not, and the distinction is kept deliberate:
 *
 *  - Projection and the sentiment meters derive from the published snapshot. The meters
 *    come from where the expert panel disagreed, which is the same information the
 *    premium Upside Potential and Bust Risk meters express, recovered from data that is
 *    published rather than gated.
 *  - Matchup, defensive and weather values are invented. They are seeded from the player
 *    id so they never change between renders, but they are dressing. Nothing in the
 *    recommendation reads them.
 */

/** The numeric part of a positional rank, e.g. "WR13" gives 13. */
export function rankNumber(player: Player): number {
  const parsed = Number.parseInt(player.posRank.replace(/\D/g, ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/** Projected fantasy points, as published. */
export function projectedPoints(player: Player): number {
  return player.projectedPoints ?? 0;
}

/** Matchup difficulty, 1 hardest to 5 easiest. Invented. */
export function matchupRating(player: Player): number {
  return 1 + Math.floor(seeded(player.id, 7) * 5);
}

export interface DefenseAllowed {
  attempts: number;
  yards: number;
  touchdowns: number;
}

/** What the opponent defense has been giving up. Invented. */
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

/** Season production, anchored to the published projection. */
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

/** Kickoff weather in Fahrenheit. Invented. */
export function weather(player: Player): number {
  return Math.round(52 + seeded(player.id, 31) * 26);
}

/**
 * Availability, read from the real designations rather than invented.
 *
 * This used to be a hardcoded pair of ids, chosen before the injury snapshot existed. It
 * then contradicted the snapshot on the same screen: D. Smith carried his Q tag beside his
 * name in the results band and in this table read "Healthy", while R. Bateman read
 * "Questionable" with no designation at all.
 *
 * That is precisely the defect this prototype points at in the live product, where a
 * questionable player renders as Healthy on mobile. Reproducing it by accident, in the one
 * artefact making the argument, is not a defensible place to leave it.
 */
export function injuryStatus(player: Player): string {
  const designation = designationFor(player.id);
  if (!designation) return "Healthy";
  const wording = DESIGNATION_WORDING[designation];
  return wording.charAt(0).toUpperCase() + wording.slice(1);
}

/** Map a spread in rank positions onto the product's five-level meter. */
function toLevel(room: number, scale: number): SentimentLevel {
  const level = Math.min(5, Math.max(1, Math.round(1 + (room / scale) * 4)));
  return level as SentimentLevel;
}

/**
 * Sentiment, derived from where the panel disagreed.
 *
 * Overall rewards a tight consensus: a player the panel agrees on scores high. Upside is
 * how far above his average the most optimistic expert puts him, bust risk how far below
 * the most pessimistic one does.
 */
export function sentimentOverall(player: Player): SentimentLevel {
  const spread = player.worst - player.best;
  return toLevel(Math.max(0, 20 - spread), 20);
}

export function sentimentUpside(player: Player): SentimentLevel {
  return toLevel(upsideRoom(player), 12);
}

export function sentimentBust(player: Player): SentimentLevel {
  return toLevel(bustRoom(player), 14);
}
