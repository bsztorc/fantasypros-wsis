import { designationFor } from "@/lib/injuries";

/**
 * The injury designation shown beside a player's name.
 *
 * Appended rather than placed, so adding one never moves the name. Renders nothing when a
 * player has no designation, which is most of them.
 *
 * The live product shows a questionable player as "Healthy" in a green label on mobile,
 * which is the opposite of the truth for the status users ask about most. Here a
 * designation always reads as a warning.
 */
export function InjuryTag({ playerId, className = "" }: { playerId: string; className?: string }) {
  const designation = designationFor(playerId);
  if (!designation) return null;

  return (
    <sup
      className={`ml-1 font-bold text-[#e2483d] ${className}`}
      title={`Injury designation: ${designation}`}
    >
      {designation}
    </sup>
  );
}
