"use client";

import { CheckCircle } from "@/components/ui/icons";
import { InjuryTag } from "@/components/ui/injury-tag";
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
        /*
         * Five columns of detail beside a name need about 260px of the 295px a phone has,
         * which leaves the name itself 35px. Below `sm` the three detail columns drop out
         * and reappear as one line under the name, so the row keeps every value it shows
         * on desktop and the name gets the width instead.
         */
        "grid w-full grid-cols-[28px_minmax(0,1fr)_20px] items-center gap-2 px-3 py-[9px] text-left sm:grid-cols-[28px_minmax(0,1fr)_68px_58px_46px_20px]",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-slate-50",
      ].join(" ")}
    >
      <PositionBadge position={player.position} />
      <span className="truncate text-sm font-medium text-fp-link">
        {player.name}
        <InjuryTag playerId={player.id} />
      </span>
      <span className="hidden text-[11px] text-fp-muted sm:block">
        {player.position} - {player.team}
      </span>
      <span className="hidden text-[11px] text-fp-muted sm:block">{player.opponent}</span>
      <span className="hidden text-[11px] text-fp-muted sm:block">{player.posRank}</span>
      <CheckCircle
        className={`h-[18px] w-[18px] ${selected ? "text-fp-blue" : "text-slate-300"}`}
      />
      {/*
        Last in the row so the columns above keep their order, and hidden from `sm` up where
        those columns carry the same values themselves.
      */}
      <span className="col-span-3 -mt-1 truncate pl-[36px] text-[11px] text-fp-muted sm:hidden">
        {player.position} - {player.team} · {player.opponent} · {player.posRank}
      </span>
    </button>
  );
}
