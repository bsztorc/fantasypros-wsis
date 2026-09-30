"use client";

import { useState } from "react";
import { CheckCircle } from "@/components/ui/icons";
import { InjuryTag } from "@/components/ui/injury-tag";
import { POSITION_FILTERS, TOP_PLAYERS } from "@/lib/fixtures/top-players";
import type { Player } from "@/lib/types";

interface TopPlayersPanelProps {
  selectedIds: string[];
  selectable: boolean;
  onToggle: (player: Player) => void;
}

/**
 * Top Players: the default list the current product shows before a user picks anyone.
 *
 * Kept as-is. The prototype's argument is not that this list is wrong, but that it is a
 * comparison starting point rather than a decision the user arrived with.
 */
export function TopPlayersPanel({ selectedIds, selectable, onToggle }: TopPlayersPanelProps) {
  const [filter, setFilter] = useState<string>("FLEX");

  const columns = [TOP_PLAYERS.slice(0, 10), TOP_PLAYERS.slice(10, 20), TOP_PLAYERS.slice(20, 30)];

  return (
    <div className="px-5 pb-6">
      {/*
        One row on a phone, which the eight remaining filters fit at this size without
        wrapping onto a second line. IDP is dropped below `sm` rather than removed from
        POSITION_FILTERS, because that list is what the live tool shows and the desktop
        grid has the room for all nine.
      */}
      <div className="mb-3 flex flex-nowrap justify-between gap-1 sm:flex-wrap sm:justify-start sm:gap-5">
        {POSITION_FILTERS.map((position) => (
          <button
            key={position}
            type="button"
            onClick={() => setFilter(position)}
            className={[
              "cursor-pointer whitespace-nowrap pb-0.5 text-[11px] font-semibold transition-colors sm:text-[13px]",
              position === "IDP" ? "hidden sm:block" : "",
              filter === position
                ? "text-white underline underline-offset-4"
                : "text-fp-on-navy hover:text-white",
            ].join(" ")}
          >
            {position}
          </button>
        ))}
      </div>

      {/* One continuous list on a phone, the same way My Team is. */}
      <div className="grid gap-0 overflow-hidden rounded-lg bg-white py-1 sm:gap-5 sm:overflow-visible sm:rounded-none sm:bg-transparent sm:py-0 sm:grid-cols-2 lg:grid-cols-3">
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="rounded-none bg-transparent py-0 sm:overflow-hidden sm:rounded-lg sm:bg-white sm:py-1"
          >
            {column.map((player, rowIndex) => {
              const selected = selectedIds.includes(player.id);
              const disabled = !selected && !selectable;
              return (
                <button
                  key={player.id}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => onToggle(player)}
                  className={[
                    "grid w-full grid-cols-[26px_minmax(0,1fr)_74px_22px] items-center gap-2 px-3 py-[9px] text-left",
                    disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span className="text-[13px] text-fp-ink">
                    {columnIndex * 10 + rowIndex + 1}.
                  </span>
                  <span className="truncate text-sm font-medium text-fp-link">
                    {player.name}
                    <InjuryTag playerId={player.id} />
                  </span>
                  <span className="text-[11px] text-fp-muted">
                    {player.position} - {player.team}
                  </span>
                  <CheckCircle
                    className={`h-[18px] w-[18px] ${selected ? "text-fp-blue" : "text-slate-300"}`}
                  />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
