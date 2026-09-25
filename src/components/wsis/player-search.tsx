"use client";

import { useState } from "react";
import { SearchIcon } from "@/components/ui/icons";
import type { Player } from "@/lib/types";

interface PlayerSearchProps {
  /** Everything the current demo state lets the user search. */
  pool: Player[];
  selectedIds: string[];
  onSelect: (player: Player) => void;
  disabled: boolean;
}

/** The search pill, with a type-ahead list drawn from the fixture pool. */
export function PlayerSearch({ pool, selectedIds, onSelect, disabled }: PlayerSearchProps) {
  const [query, setQuery] = useState("");

  const matches = query.trim()
    ? pool
        .filter(
          (player) =>
            !selectedIds.includes(player.id) &&
            player.name.toLowerCase().includes(query.trim().toLowerCase()),
        )
        .slice(0, 6)
    : [];

  return (
    <div className="relative px-5 pb-4">
      <div className="flex h-12 items-center gap-3 rounded-full border border-fp-border bg-white px-5">
        <SearchIcon className="h-5 w-5 shrink-0 text-fp-ink" />
        <input
          type="search"
          value={query}
          disabled={disabled}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={disabled ? "Comparison is full" : "Add a player"}
          aria-label="Add a player to the comparison"
          className="w-full bg-transparent text-sm text-fp-ink placeholder:text-fp-muted focus:outline-none disabled:cursor-not-allowed"
        />
      </div>

      {matches.length > 0 && (
        <ul className="absolute left-5 right-5 z-10 mt-1 overflow-hidden rounded-lg border border-fp-border bg-white shadow-lg">
          {matches.map((player) => (
            <li key={player.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(player);
                  setQuery("");
                }}
                className="flex w-full cursor-pointer items-center justify-between px-5 py-2.5 text-left text-sm hover:bg-slate-50"
              >
                <span className="font-medium text-fp-ink">{player.name}</span>
                <span className="text-xs text-fp-muted">
                  {player.position} - {player.team} · {player.opponent}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
