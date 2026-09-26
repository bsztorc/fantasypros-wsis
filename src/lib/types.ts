/** Roster position, used for badge color and eligibility. */
export type Position = "QB" | "RB" | "WR" | "TE" | "K" | "DST";

/** A player as the comparison tool knows them. */
/**
 * A player as the comparison tool knows them.
 *
 * This is the shape the rankings snapshot provides, so every screen renders real Week 3
 * data including the dispersion the recommendation engine reads.
 */
export type { RankedPlayer as Player } from "@/lib/rankings";

/** Which demo state the prototype is presenting. */
export type DemoState = "signed-out" | "signed-in-unsynced" | "premium-synced";

/** How the recommendation should weight floor against ceiling. */
export type LineupGoal = "balanced" | "most-upside" | "safe-floor";

/** How many lineup spots the user is filling. */
export type StartN = 1 | 2 | 3;

/** Which panel is showing below the player slots. */
export type TeamTab = "my-team" | "top-players";
