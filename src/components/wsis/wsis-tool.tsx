"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { LineupControls } from "@/components/wsis/lineup-controls";
import { MyTeamPanel } from "@/components/wsis/my-team-panel";
import { PlayerSearch } from "@/components/wsis/player-search";
import { PlayerSlots } from "@/components/wsis/player-slots";
import { TeamTabs } from "@/components/wsis/team-tabs";
import { TopPlayersPanel } from "@/components/wsis/top-players-panel";
import { WsisBanner } from "@/components/wsis/wsis-banner";
import { DEMO_STATES, maxEnabledStartN } from "@/lib/demo-state";
import { MY_ROSTER } from "@/lib/fixtures/roster";
import { TOP_PLAYERS } from "@/lib/fixtures/top-players";
import type { DemoState, LineupGoal, Player, StartN, TeamTab } from "@/lib/types";

/**
 * The Who Should I Start? tool, with the two controls this prototype proposes.
 *
 * All three access states render from this one component. Switching state resets the
 * comparison so each walkthrough starts clean, which is a demo convenience rather than
 * proposed product behaviour.
 */
export function WsisTool() {
  const [demoState, setDemoState] = useState<DemoState>("signed-in-synced");
  const [selected, setSelected] = useState<Player[]>([]);
  const [goal, setGoal] = useState<LineupGoal>("balanced");
  const [startN, setStartN] = useState<StartN>(1);
  const [tab, setTab] = useState<TeamTab>("my-team");

  const capabilities = DEMO_STATES[demoState];
  const selectedIds = selected.map((player) => player.id);
  const selectable = selected.length < capabilities.openSlots;

  const searchPool = capabilities.hasRoster ? [...MY_ROSTER, ...TOP_PLAYERS] : TOP_PLAYERS;

  /** Keep Start N legal whenever the comparison changes size. */
  function applySelection(players: Player[]) {
    setSelected(players);
    const highest = maxEnabledStartN(players.length);
    if (startN > highest) setStartN(highest);
  }

  function handleDemoStateChange(next: DemoState) {
    setDemoState(next);
    setSelected([]);
    setStartN(1);
    setTab("my-team");
  }

  function handleToggle(player: Player) {
    const alreadySelected = selectedIds.includes(player.id);
    if (alreadySelected) {
      applySelection(selected.filter((entry) => entry.id !== player.id));
    } else if (selectable) {
      applySelection([...selected, player]);
    }
  }

  function handleRemove(playerId: string) {
    applySelection(selected.filter((entry) => entry.id !== playerId));
  }

  return (
    <>
      <AppHeader demoState={demoState} onDemoStateChange={handleDemoStateChange} />

      <main className="mx-auto w-full max-w-[1180px] px-5 py-6">
        <div className="overflow-hidden rounded-lg bg-fp-navy">
          <WsisBanner />

          <PlayerSearch
            pool={searchPool}
            selectedIds={selectedIds}
            onSelect={handleToggle}
            disabled={!selectable}
          />

          <LineupControls
            goal={goal}
            onGoalChange={setGoal}
            startN={startN}
            onStartNChange={setStartN}
            playerCount={selected.length}
          />

          <PlayerSlots
            players={selected}
            openSlots={capabilities.openSlots}
            lockedSlots={capabilities.lockedSlots}
            onRemove={handleRemove}
            canGetAdvice={selected.length >= 2}
          />

          <TeamTabs active={tab} onChange={setTab} />

          <div className="bg-fp-navy-tab pt-4">
            {tab === "my-team" ? (
              <MyTeamPanel
                demoState={demoState}
                hasRoster={capabilities.hasRoster}
                selectedIds={selectedIds}
                selectable={selectable}
                onToggle={handleToggle}
              />
            ) : (
              <TopPlayersPanel
                selectedIds={selectedIds}
                selectable={selectable}
                onToggle={handleToggle}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
