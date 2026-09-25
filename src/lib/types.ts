/** Roster position, used for badge colour and eligibility. */
export type Position = "QB" | "RB" | "WR" | "TE" | "K" | "DST";

/** A player as the comparison tool knows them. */
export interface Player {
  id: string;
  /** Display name, abbreviated the way FantasyPros renders it. */
  name: string;
  position: Position;
  /** NFL team abbreviation. */
  team: string;
  /** This week's opponent, pre-formatted, e.g. "at PIT" or "vs. NYJ". */
  opponent: string;
  /** Expert consensus positional rank, e.g. "RB1". */
  rank: string;
}

/** Which demo state the prototype is presenting. */
export type DemoState = "signed-out" | "signed-in-unsynced" | "premium-synced";

/** How the recommendation should weight floor against ceiling. */
export type LineupGoal = "balanced" | "most-upside" | "safe-floor";

/** How many lineup spots the user is filling. */
export type StartN = 1 | 2 | 3;

/** Which panel is showing below the player slots. */
export type TeamTab = "my-team" | "top-players";
