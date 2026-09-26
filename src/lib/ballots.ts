import { seeded } from "@/lib/seed";
import type { RankedPlayer } from "@/lib/rankings";

/**
 * Reconstructed expert ballots.
 *
 * FantasyPros publishes, for every ranked player, the consensus rank and the dispersion
 * behind it: best rank, worst rank, average and standard deviation. It does not publish
 * individual ballots in bulk. This rebuilds a panel whose disagreement matches the
 * published dispersion.
 *
 * Validated against the product: for Hampton against Hubbard this produces 27 first-place
 * votes to 19, where FantasyPros publishes 26 to 20.
 *
 * Every value is deterministic. The same players always produce the same panel, so a
 * walkthrough can be repeated and a screenshot still matches the page.
 */

/** Experts on the panel when every compared player shares a position. */
export const PANEL_SIZE = 46;

/** How much of a rank comes from the expert's own lean rather than player-specific noise. */
const CORRELATION = 0.45;

/** A single expert's view: player id to the rank they gave. */
export type Ballot = Map<string, number>;

/** Box-Muller, driven by a seeded generator so a panel is reproducible. */
function normalFrom(next: () => number): number {
  const u = Math.max(next(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * next());
}

/**
 * Build a panel of ballots over the given players.
 *
 * Each expert carries a persistent lean, scaled by how uncertain a player is. An expert
 * who is bullish on volatile players is bullish on all of them, so their ballot hangs
 * together instead of being independent noise per player. That matters here: real
 * disagreement clusters, and independent noise would understate how often a comparison is
 * genuinely close.
 */
export function buildPanel(players: RankedPlayer[], panelSize = PANEL_SIZE): Ballot[] {
  if (players.length === 0) return [];

  const spread = players.reduce((sum, p) => sum + p.deviation, 0) / players.length || 1;
  const key = players.map((p) => p.id).join("-");

  return Array.from({ length: panelSize }, (_, expertIndex) => {
    let counter = 0;
    const next = () => seeded(`${key}:${expertIndex}:${counter++}`, 0x5f3a);
    const lean = normalFrom(next);

    const scored = players.map((player) => {
      const tilt = lean * (player.deviation / spread);
      const offset =
        player.deviation * (CORRELATION * tilt + Math.sqrt(1 - CORRELATION ** 2) * normalFrom(next));
      return {
        id: player.id,
        raw: Math.min(player.worst, Math.max(player.best, player.average + offset)),
      };
    });

    scored.sort((a, b) => a.raw - b.raw);
    const ballot: Ballot = new Map();
    scored.forEach((entry, index) => ballot.set(entry.id, index + 1));
    return ballot;
  });
}

/**
 * Upside and bust room, derived from where the panel disagrees.
 *
 * FantasyPros gates its own Upside Potential and Bust Risk meters behind premium, so they
 * are not in the snapshot. These are not those meters. They are the same idea recovered
 * from data that is published: how much better the most optimistic expert sees a player
 * than the average, and how much worse the most pessimistic one does.
 */
export function upsideRoom(player: RankedPlayer): number {
  return Math.max(0, player.average - player.best);
}

export function bustRoom(player: RankedPlayer): number {
  return Math.max(0, player.worst - player.average);
}
