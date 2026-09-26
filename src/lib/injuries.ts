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

/**
 * Whether a designation settles the question of playing.
 *
 * Out, injured reserve, physically unable to perform and suspended all mean the player is
 * not playing. Questionable and doubtful mean the opposite: the status is unresolved, and
 * it usually resolves through the week's practice reports, which this prototype does not
 * hold. That distinction matters for what the summary is allowed to say.
 */
export function isRuledOut(designation: Designation): boolean {
  return designation === "O" || designation === "IR" || designation === "PUP" || designation === "SUSP";
}

/** The full wording, for a summary sentence rather than a label. */
export const DESIGNATION_WORDING: Record<Designation, string> = {
  Q: "questionable",
  D: "doubtful",
  O: "out",
  IR: "on injured reserve",
  PUP: "on the physically unable to perform list",
  SUSP: "suspended",
};
