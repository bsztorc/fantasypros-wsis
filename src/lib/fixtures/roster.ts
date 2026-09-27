import { playerById, SNAPSHOT, type RankedPlayer } from "@/lib/rankings";

/**
 * The synced user's roster, as drawn in the concept design, with two substitutions.
 *
 * Vele and Godwin are replaced by M. Wilson and R. Bateman so the roster contains a real
 * flex dilemma. Mitchell, Wilson and Bateman sit in the same receiver tier, and the expert
 * rankings behind them do not support the order the current display puts them in: Bateman is
 * boom or bust, ranked best of the three by a minority and last by most, while Mitchell is
 * nobody's favorite and almost everybody's acceptable second.
 *
 * Pittman is left out: he is injured, and a roster that starts an injured player invites
 * a question that has nothing to do with the feature.
 *
 * Every player is real and every rank comes from the Week 3 snapshot.
 */
const ROSTER_IDS = [
  "19196", // J. Burrow
  "22968", // J. Gibbs
  "17240", // S. Barkley
  "25403", // J. Love
  "16421", // A. Kamara
  "23163", // D. London
  "24357", // A. Mitchell
  "25333", // M. Wilson
  "19794", // R. Bateman
  "19222", // D. Smith
  "27331", // KC Concepcion Jr.
  "25337", // T. Tucker
  "23000", // B. Thomas Jr.
  "26434", // T. Warren
  "8260", //  SEA DST
  "19058", // C. McLaughlin
];

/**
 * The order a roster is read in: by position, then by consensus rank within it.
 *
 * Sorted rather than hand-ordered. The ids above were listed in roughly this order once and
 * drifted out of it as the snapshot moved, which put a WR7 below three receivers ranked in
 * the thirties. Rank is a property of the snapshot, so the order has to be derived from the
 * snapshot or it goes stale again the next time the data is re-frozen.
 */
const POSITION_ORDER: Record<string, number> = { QB: 0, RB: 1, WR: 2, TE: 3, DST: 4, K: 5 };

const positionalRank = (player: RankedPlayer) =>
  Number(String(player.posRank).replace(/\D/g, "")) || Number.MAX_SAFE_INTEGER;

export const MY_ROSTER: RankedPlayer[] = ROSTER_IDS.map((id) => {
  const player = playerById(id);
  if (!player) throw new Error(`Roster player ${id} is not in the rankings snapshot`);
  return player;
}).sort((a, b) => {
  const byPosition =
    (POSITION_ORDER[a.position] ?? 99) - (POSITION_ORDER[b.position] ?? 99);
  return byPosition !== 0 ? byPosition : positionalRank(a) - positionalRank(b);
});

/** The synced user's league, shown in the roster picker. */
export const MY_LEAGUE = "The Quest for the Tyler";

/**
 * Week and scoring format, shown in the tool banner.
 *
 * The week comes from the snapshot. The scoring label does not: the snapshot records the
 * scoring of whichever list was harvested first, and quarterbacks, kickers and defenses
 * are ranked in standard scoring even when the tool is set to half PPR. The tool's own
 * format is what belongs in the banner.
 */
export const WEEK_LABEL = `Week ${SNAPSHOT.week}`;
export const SCORING_LABEL = "HALF";
