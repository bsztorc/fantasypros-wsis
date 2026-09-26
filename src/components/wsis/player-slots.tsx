"use client";

import { CloseIcon, LockIcon, PlayerSilhouette } from "@/components/ui/icons";
import type { Player } from "@/lib/types";

interface PlayerSlotsProps {
  players: Player[];
  openSlots: number;
  lockedSlots: number;
  onRemove: (playerId: string) => void;
  canGetAdvice: boolean;
  onViewAdvice: () => void;
}

/**
 * One comparison slot: a selected player, an empty silhouette, or a locked slot.
 *
 * A filled slot is not itself clickable. Removal is an explicit action, either the X in
 * the corner or deselecting the player in the list below, so the card can be read without
 * the risk of clearing it by accident.
 */
function Slot({
  player,
  locked,
  onRemove,
}: {
  player?: Player;
  locked: boolean;
  onRemove: (playerId: string) => void;
}) {
  return (
    <div className="relative flex h-[185px] flex-1 flex-col items-center justify-end overflow-hidden border-r border-fp-navy-divider/60 px-2 pt-3">
      <span className="absolute top-3 text-sm font-semibold text-fp-on-navy">
        {player ? player.posRank : "-"}
      </span>

      {player && !locked && (
        <button
          type="button"
          onClick={() => onRemove(player.id)}
          aria-label={`Remove ${player.name} from the comparison`}
          className="absolute right-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-fp-on-navy transition-colors hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      )}

      {locked ? (
        <div className="flex h-full w-full items-center justify-center">
          <LockIcon className="h-11 w-11 text-white/85" />
        </div>
      ) : player ? (
        <div className="flex flex-col items-center gap-1 pb-3">
          <PlayerSilhouette className="h-16 w-16 text-white/20" />
          <span className="text-sm font-semibold text-white">{player.name}</span>
          <span className="text-xs text-fp-on-navy">
            {player.position} - {player.team} · {player.opponent}
          </span>
        </div>
      ) : (
        <PlayerSilhouette className="-mb-7 h-32 w-32 text-white/[0.09]" />
      )}
    </div>
  );
}

/**
 * The four-slot comparison strip with the View Advice button.
 *
 * Signed-out users see two open slots and two padlocks, which is the current product
 * behaviour and the reason that state cannot express a multi-slot decision.
 */
export function PlayerSlots({
  players,
  openSlots,
  lockedSlots,
  onRemove,
  canGetAdvice,
  onViewAdvice,
}: PlayerSlotsProps) {
  const open = Array.from({ length: openSlots });
  const locked = Array.from({ length: lockedSlots });

  return (
    <div className="flex overflow-hidden bg-fp-navy-slot">
      {open.map((_, index) => (
        <Slot key={`open-${index}`} player={players[index]} locked={false} onRemove={onRemove} />
      ))}
      {locked.map((_, index) => (
        <Slot key={`locked-${index}`} locked onRemove={onRemove} />
      ))}

      <div className="flex w-[185px] shrink-0 items-center justify-center px-4">
        <button
          type="button"
          disabled={!canGetAdvice}
          onClick={onViewAdvice}
          className={[
            "rounded-md px-6 py-2.5 text-sm font-bold leading-tight transition-colors",
            canGetAdvice
              ? "bg-fp-blue text-white hover:bg-fp-blue-bright cursor-pointer"
              : "bg-fp-disabled text-white/90 cursor-not-allowed",
          ].join(" ")}
        >
          View
          <br />
          Advice
        </button>
      </div>
    </div>
  );
}
