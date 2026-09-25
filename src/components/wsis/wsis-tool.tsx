"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { AdviceView } from "@/components/wsis/advice/advice-view";
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

/** Which view the widget is showing. */
type View = "compare" | "advice";

/** A comparison needs at least two players before there is any advice to give. */
const MINIMUM_FOR_ADVICE = 2;

/**
 * The Who Should I Start? tool, with the two controls this prototype proposes.
 *
 * All three access states render from this one component. Switching state resets the
 * comparison so each walkthrough starts clean, which is a demo convenience rather than
 * proposed product behaviour.
 */
export function WsisTool() {
  const [demoState, setDemoState] = useState<DemoState>("premium-synced");
  const [selected, setSelected] = useState<Player[]>([]);
  const [goal, setGoal] = useState<LineupGoal>("balanced");
  const [startN, setStartN] = useState<StartN>(1);
  const [tab, setTab] = useState<TeamTab>("my-team");
  const [view, setView] = useState<View>("compare");

  const capabilities = DEMO_STATES[demoState];
  const selectedIds = selected.map((player) => player.id);
  const selectable = selected.length < capabilities.openSlots;
  const canGetAdvice = selected.length >= MINIMUM_FOR_ADVICE;

  const searchPool = capabilities.hasRoster ? [...MY_ROSTER, ...TOP_PLAYERS] : TOP_PLAYERS;

  /** Keep Start N legal, and leave the advice view if the comparison falls apart. */
  function applySelection(players: Player[]) {
    setSelected(players);

    const highest = maxEnabledStartN(players.length);
    if (startN > highest) setStartN(highest);

    if (players.length < MINIMUM_FOR_ADVICE) setView("compare");
  }

  function handleDemoStateChange(next: DemoState) {
    setDemoState(next);
    setSelected([]);
    setStartN(1);
    if (!DEMO_STATES[next].isPremium) setGoal("balanced");
    setTab("my-team");
    setView("compare");
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
        {view === "advice" ? (
          <AdviceView
            players={selected}
            demoState={demoState}
            openSlots={capabilities.openSlots}
            isPremium={capabilities.isPremium}
            pool={searchPool}
            onSelect={handleToggle}
            onBack={() => setView("compare")}
            onRemove={handleRemove}
          />
        ) : (
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
              isPremium={capabilities.isPremium}
            />

            <PlayerSlots
              players={selected}
              openSlots={capabilities.openSlots}
              lockedSlots={capabilities.lockedSlots}
              onRemove={handleRemove}
              canGetAdvice={canGetAdvice}
              onViewAdvice={() => setView("advice")}
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
        )}
      </main>
    </>
  );
}
