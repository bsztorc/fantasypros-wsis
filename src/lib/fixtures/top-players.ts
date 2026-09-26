import { list, type RankedPlayer } from "@/lib/rankings";

/**
 * The Top Players list the tool shows before a user picks anyone.
 *
 * Drawn from the real flex consensus rather than invented. Kept as-is as a feature: the
 * prototype's argument is not that this list is wrong, but that it is a comparison
 * starting point rather than the decision a user arrived with.
 */
export const TOP_PLAYERS: RankedPlayer[] = list("FLEX").slice(0, 30);

/** Position filter tabs above the Top Players grid, matching the live tool. */
export const POSITION_FILTERS = ["QB", "RB", "WR", "TE", "FLEX", "Superflex", "K", "DST", "IDP"] as const;
