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
  "19196", // QB9    J. Burrow
  "22968", // RB1    J. Gibbs
  "17240", // RB10   S. Barkley
  "25403", // RB25   J. Love
  "16421", // RB51   A. Kamara
  "23163", // WR13   D. London
  "24357", // WR30   A. Mitchell
  "25333", // WR29   M. Wilson
  "19794", // WR33   R. Bateman
  "19222", // WR7    D. Smith
  "27331", // WR47   KC Concepcion Jr.
  "25337", // WR45   T. Tucker
  "23000", // WR48   B. Thomas Jr.
  "26434", // TE9    T. Warren
  "8260", //  DST1   SEA DST
  "19058", // K14    C. McLaughlin
];

export const MY_ROSTER: RankedPlayer[] = ROSTER_IDS.map((id) => {
  const player = playerById(id);
  if (!player) throw new Error(`Roster player ${id} is not in the rankings snapshot`);
  return player;
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
