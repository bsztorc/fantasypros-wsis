import { seeded } from "@/lib/seed";
import type { RankedPlayer } from "@/lib/rankings";

/**
 * Reconstructed expert rankings.
 *
 * FantasyPros publishes, for every ranked player, the consensus rank and the dispersion
 * behind it: best rank, worst rank, average and standard deviation. It does not publish
 * individual expert rankings in bulk. This rebuilds a panel whose disagreement matches the
 * published dispersion.
 *
 * A reconstruction, not a recovery. The published dispersion constrains the panel but does
 * not determine it, so what this reproduces is how much the experts disagree, not who said
 * what. It was sanity-checked once against a published head-to-head to confirm the snapshot
 * behaves like the real product. That is not a precision claim and is not re-checked as a
 * gate: when two players sit within a fraction of a rank of each other, which one comes out
 * ahead is inside the reconstruction margin.
 *
 * Every value is deterministic. The same players always produce the same panel, so a
 * walkthrough can be repeated and a screenshot still matches the page.
 */

/** Experts on the panel when every compared player shares a position. */
export const BASE_PANEL_SIZE = 46;

/**
 * How many experts can express a preference between these players.
 *
 * Not a constant. Only an expert who ranked every player in the comparison has an opinion
 * about the order of all of them, and experts do not all rank every position. Mixing
 * positions therefore thins the panel.
 *
 * Calibrated against the product, which reports 45 to 46 experts for a comparison of
 * running backs and 42 once a wide receiver joins them.
 */
export function panelSizeFor(players: RankedPlayer[]): number {
  const positions = new Set(players.map((p) => p.position));
  return Math.max(12, BASE_PANEL_SIZE - 3 * (positions.size - 1));
}

/** How much of a rank comes from the expert's own lean rather than player-specific noise. */
const CORRELATION = 0.45;

/**
 * A single expert's view: player id to the rank they gave that player.
 *
 * The value is the expert's rank on the underlying board, not their position within this
 * comparison. Keeping the board rank matters: it preserves how far apart the expert put
 * these players, which is what a lineup goal has to work against. Collapsing it to first,
 * second and third would leave every gap looking identical.
 */
export type ExpertRanking = Map<string, number>;

/** Box-Muller, driven by a seeded generator so a panel is reproducible. */
function normalFrom(next: () => number): number {
  const u = Math.max(next(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * next());
}

/**
 * Build a panel of expert rankings over the given players.
 *
 * Each expert carries a persistent lean, scaled by how uncertain a player is. An expert
 * who is bullish on volatile players is bullish on all of them, so their ranking hangs
 * together instead of being independent noise per player. That matters here: real
 * disagreement clusters, and independent noise would understate how often a comparison is
 * genuinely close.
 */
export function buildPanel(
  players: RankedPlayer[],
  panelSize = panelSizeFor(players),
): ExpertRanking[] {
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

    const ranking: ExpertRanking = new Map();
    for (const entry of scored) ranking.set(entry.id, entry.raw);
    return ranking;
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
