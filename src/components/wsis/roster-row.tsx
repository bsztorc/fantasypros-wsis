"use client";

import { CheckCircle } from "@/components/ui/icons";
import { PositionBadge } from "@/components/ui/position-badge";
import type { Player } from "@/lib/types";

interface RosterRowProps {
  player: Player;
  selected: boolean;
  /** False when the comparison is full and this player is not already in it. */
  selectable: boolean;
  onToggle: (player: Player) => void;
}

/** A single row in the My Team card. */
export function RosterRow({ player, selected, selectable, onToggle }: RosterRowProps) {
  const disabled = !selected && !selectable;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(player)}
      aria-pressed={selected}
      className={[
        "grid w-full grid-cols-[28px_minmax(0,1fr)_68px_58px_46px_20px] items-center gap-2 px-3 py-[9px] text-left",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-slate-50",
      ].join(" ")}
    >
      <PositionBadge position={player.position} />
      <span className="truncate text-sm font-medium text-fp-link">{player.name}</span>
      <span className="text-[11px] text-fp-muted">
        {player.position} - {player.team}
      </span>
      <span className="text-[11px] text-fp-muted">{player.opponent}</span>
      <span className="text-[11px] text-fp-muted">{player.rank}</span>
      <CheckCircle
        className={`h-[18px] w-[18px] ${selected ? "text-fp-blue" : "text-slate-300"}`}
      />
    </button>
  );
}
