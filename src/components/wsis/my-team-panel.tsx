"use client";

import { ChevronDown } from "@/components/ui/icons";
import { RosterRow } from "@/components/wsis/roster-row";
import { SyncPrompt } from "@/components/wsis/sync-prompt";
import { MY_LEAGUE, MY_ROSTER } from "@/lib/fixtures/roster";
import type { DemoState, Player } from "@/lib/types";

interface MyTeamPanelProps {
  demoState: DemoState;
  hasRoster: boolean;
  selectedIds: string[];
  selectable: boolean;
  onToggle: (player: Player) => void;
}

/** My Team: the synced user's roster, or a prompt to sync one. */
export function MyTeamPanel({
  demoState,
  hasRoster,
  selectedIds,
  selectable,
  onToggle,
}: MyTeamPanelProps) {
  if (!hasRoster) {
    return (
      <div className="px-5 pb-6">
        <SyncPrompt demoState={demoState} />
      </div>
    );
  }

  const half = Math.ceil(MY_ROSTER.length / 2);
  const columns = [MY_ROSTER.slice(0, half), MY_ROSTER.slice(half)];

  return (
    <div className="px-5 pb-6">
      <div className="mb-3 hidden justify-end sm:flex">
        <div className="relative">
          <select
            aria-label="League"
            defaultValue={MY_LEAGUE}
            className="w-[200px] cursor-pointer appearance-none rounded-md border border-fp-border bg-white py-2 pl-3 pr-9 text-[13px] text-fp-ink focus:outline-none"
          >
            <option>{MY_LEAGUE}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fp-ink" />
        </div>
      </div>

      {/*
        One list on a phone. The roster is split in two so desktop can run it as two
        columns; stacked on a phone that split turns into two cards with a gap between
        them, which reads as two rosters. Below `sm` the white card and its padding move
        out to the grid itself and the halves become plain runs of rows inside it, so the
        seam disappears without the roster being split differently for each width.
      */}
      <div className="grid gap-0 overflow-hidden rounded-lg bg-white py-1 sm:gap-5 sm:overflow-visible sm:rounded-none sm:bg-transparent sm:py-0 lg:grid-cols-2">
        {columns.map((column, index) => (
          <div
            key={index}
            className="rounded-none bg-transparent py-0 sm:overflow-hidden sm:rounded-lg sm:bg-white sm:py-1"
          >
            {column.map((player) => (
              <RosterRow
                key={player.id}
                player={player}
                selected={selectedIds.includes(player.id)}
                selectable={selectable}
                onToggle={onToggle}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
