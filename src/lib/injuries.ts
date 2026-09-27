import snapshot from "@/lib/fixtures/injuries-week3.json";

/**
 * Injury designations, as the NFL and FantasyPros use them.
 *
 * Captured from FantasyPros player pages. A player with no entry carries no designation,
 * which is the overwhelming majority: the designation is the exception, so an absent one
 * needs no display and no explanation.
 */
export type Designation = "Q" | "D" | "O" | "IR" | "PUP" | "SUSP";

const DESIGNATIONS = snapshot.designations as Record<string, Designation>;

export function designationFor(playerId: string): Designation | null {
  return DESIGNATIONS[playerId] ?? null;
}

/** The full wording, for the Injury Status row rather than the label beside a name. */
export const DESIGNATION_WORDING: Record<Designation, string> = {
  Q: "questionable",
  D: "doubtful",
  O: "out",
  IR: "on injured reserve",
  PUP: "on the physically unable to perform list",
  SUSP: "suspended",
};
