"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { AdviceView } from "@/components/wsis/advice/advice-view";
import { LineupControls } from "@/components/wsis/lineup-controls";
import { MyTeamPanel } from "@/components/wsis/my-team-panel";
import { PlayerSearch } from "@/components/wsis/player-search";
import { PlayerSlots } from "@/components/wsis/player-slots";
import { TeamTabs } from "@/components/wsis/team-tabs";
import { TopPlayersPanel } from "@/components/wsis/top-players-panel";
import { WsisBanner } from "@/components/wsis/wsis-banner";
import { DEMO_STATES, gateVariantFor, maxEnabledStartN } from "@/lib/demo-state";
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
 * proposed product behavior.
 */
export function WsisTool() {
  const [demoState, setDemoState] = useState<DemoState>("premium-synced");
  const [selected, setSelected] = useState<Player[]>([]);
  const [goal, setGoal] = useState<LineupGoal>("balanced");
  const [startN, setStartN] = useState<StartN>(1);
  const [tab, setTab] = useState<TeamTab>("my-team");
  const [view, setView] = useState<View>("compare");

  /**
   * Open at the top, and start each view at the top.
   *
   * The header is sticky, so any scroll offset leaves the top of the tool sitting under
   * it and the reader has to scroll up to find it. Two ways in: a reload or a back
   * restores the previous scroll position, and switching to the advice view keeps the
   * scroll the user was at when they reached the button, which is usually well down the
   * roster list.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

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

  /**
   * Switching demo state keeps the comparison wherever possible.
   *
   * The demo arc depends on it: pick players, see the answer, then change state and
   * watch the same decision get better or worse. Clearing the comparison would make
   * that comparison impossible to see. Players beyond the new state's slot limit are
   * dropped, and the advice view is only left if too few players remain to support it.
   */
  function handleDemoStateChange(next: DemoState) {
    const nextCapabilities = DEMO_STATES[next];
    const kept = selected.slice(0, nextCapabilities.openSlots);

    setDemoState(next);
    setSelected(kept);
    setStartN((current) => {
      const highest = maxEnabledStartN(kept.length);
      return current > highest ? highest : current;
    });
    if (!nextCapabilities.isPremium) setGoal("balanced");
    if (kept.length < MINIMUM_FOR_ADVICE) setView("compare");
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
            goal={goal}
            onGoalChange={setGoal}
            startN={startN}
            onStartNChange={setStartN}
            onBack={() => setView("compare")}
            onRemove={handleRemove}
          />
        ) : (
          /*
           * A phone reads this top down in a different order than the desktop row does:
           * the players first, then what is being asked of them, then the means of adding
           * another, then the lists. Each section carries its own `order`, and the column
           * is only a flex container below `sm`, so on desktop the order values are inert
           * and the sections stay in source order.
           */
          <div className="flex flex-col overflow-hidden rounded-lg bg-fp-navy sm:block sm:flex-row">
            <WsisBanner
              action={
                /*
                 * The phone's Compare button, in the title row above the players. Same action
                 * and same disabled rule as the View Advice button in the comparison strip,
                 * which hides itself at this width; only one of the two is ever on screen.
                 */
                <button
                  type="button"
                  disabled={!canGetAdvice}
                  onClick={() => setView("advice")}
                  className={[
                    "h-10 shrink-0 rounded-full px-4 text-[13px] font-bold transition-colors sm:hidden",
                    canGetAdvice
                      ? "cursor-pointer bg-fp-blue text-white hover:bg-fp-blue-bright"
                      : "cursor-not-allowed bg-fp-disabled text-white/90",
                  ].join(" ")}
                >
                  Compare
                </button>
              }
            />

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
              gateVariant={gateVariantFor(demoState)}
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

            <div className="order-6 bg-fp-navy-tab pt-4">
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
