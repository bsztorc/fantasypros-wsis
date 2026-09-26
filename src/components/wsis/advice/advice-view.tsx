"use client";

import { useState } from "react";
import { ChevronDown, GearIcon } from "@/components/ui/icons";
import { AdviceTabs, type AdviceTab } from "@/components/wsis/advice/advice-tabs";
import {
  CompareModule,
  indexOfMax,
  LockedValue,
  PremiumFooter,
  Stars,
  type CompareRow,
} from "@/components/wsis/advice/compare-module";
import { ConsensusSentiment } from "@/components/wsis/advice/consensus-sentiment";
import { ResultsBand } from "@/components/wsis/advice/results-band";
import { SentimentMeter } from "@/components/wsis/advice/sentiment-meter";
import { SpinTheWheel } from "@/components/wsis/advice/spin-the-wheel";
import { LineupControls } from "@/components/wsis/lineup-controls";
import { PlayerSearch } from "@/components/wsis/player-search";
import { gateVariantFor } from "@/lib/demo-state";
import { recommend } from "@/lib/engine";
import {
  defenseAllowed,
  injuryStatus,
  matchupRating,
  rankNumber,
  seasonStats,
  sentimentBust,
  sentimentOverall,
  sentimentUpside,
  weather,
} from "@/lib/fixtures/player-detail";
import { SCORING_LABEL, WEEK_LABEL } from "@/lib/fixtures/roster";
import type { DemoState, LineupGoal, Player, StartN } from "@/lib/types";

interface AdviceViewProps {
  players: Player[];
  demoState: DemoState;
  openSlots: number;
  isPremium: boolean;
  pool: Player[];
  onSelect: (player: Player) => void;
  goal: LineupGoal;
  onGoalChange: (goal: LineupGoal) => void;
  startN: StartN;
  onStartNChange: (startN: StartN) => void;
  onBack: () => void;
  onRemove: (playerId: string) => void;
}

/** The product makes the search copy contextual to how many players are already in. */
function searchPlaceholder(count: number): string {
  if (count === 2) return "Add a third player";
  if (count === 3) return "Add a fourth player";
  return "Add a player";
}

/**
 * The advice view.
 *
 * Everything on screen derives from one reconstructed expert panel, so the percentage the
 * product shows today and the recommendation this prototype adds are two readings of the
 * same ballots rather than two competing opinions.
 */
export function AdviceView({
  players,
  demoState,
  openSlots,
  isPremium,
  pool,
  onSelect,
  goal,
  onGoalChange,
  startN,
  onStartNChange,
  onBack,
  onRemove,
}: AdviceViewProps) {
  const [tab, setTab] = useState<AdviceTab>("Overview");
  const recommendation = recommend(players, startN, goal);
  const signedOut = demoState === "signed-out";
  const canAddPlayer = players.length < openSlots;

  if (!recommendation) {
    return (
      <div className="overflow-hidden rounded-lg bg-fp-navy px-8 py-10 text-center">
        <p className="text-[15px] font-semibold text-white">
          No expert ranks these players against each other.
        </p>
        <p className="mx-auto mt-2 max-w-[440px] text-sm text-fp-on-navy">
          Kickers and defenses are only ranked within their own position, so there is no
          panel that can express a preference between them and anyone else.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-5 cursor-pointer rounded-md bg-fp-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fp-blue-bright"
        >
          Back to selection
        </button>
      </div>
    );
  }

  /**
   * Column order, shared with the results band.
   *
   * Above one slot the band groups the recommended players first, so the tables have to
   * follow or a player's card sits over someone else's numbers.
   */
  const orderedResults =
    startN > 1
      ? [
          ...recommendation.results.filter((result) => result.recommended),
          ...recommendation.results.filter((result) => !result.recommended),
        ]
      : recommendation.results;
  const ordered = orderedResults.map((result) => result.player);

  /**
   * Accuracy subsets, offset from the headline so a subset can disagree with it.
   *
   * The product publishes cases where its most accurate experts prefer a different player
   * than the full pool does. Making every subset agree would quietly delete that.
   */
  const expertAccuracyRows: CompareRow[] = [
    { label: "Top Overall Experts", offset: 9 },
    { label: `Top ${ordered[0].position} Experts`, offset: -7 },
    { label: "Top Player Experts", offset: 4 },
  ].map((subset) => {
    const shares = orderedResults.map((result, index) =>
      Math.max(0, Math.min(100, result.firstChoiceShare + (index === 1 ? subset.offset : -subset.offset / 2))),
    );
    const rounded = shares.map((value) => Math.round(value));
    return {
      label: subset.label,
      values: orderedResults.map((result, index) =>
        isPremium ? (
          <span key={result.player.id}>{rounded[index]}%</span>
        ) : (
          <LockedValue key={result.player.id} />
        ),
      ),
      bestIndex: isPremium ? indexOfMax(rounded) : undefined,
    };
  });

  const sentimentRows: CompareRow[] = [
    {
      label: "Overall",
      values: ordered.map((player) => (
        <SentimentMeter key={player.id} value={sentimentOverall(player)} />
      )),
    },
    {
      label: "Upside Potential",
      values: ordered.map((player) =>
        isPremium ? (
          <SentimentMeter key={player.id} value={sentimentUpside(player)} />
        ) : (
          <LockedValue key={player.id} />
        ),
      ),
    },
    {
      label: "Bust Risk",
      values: ordered.map((player) =>
        isPremium ? (
          <SentimentMeter key={player.id} value={sentimentBust(player)} inverted />
        ) : (
          <LockedValue key={player.id} />
        ),
      ),
    },
  ];

  const attempts = ordered.map((player) => defenseAllowed(player).attempts);
  const yardsAllowed = ordered.map((player) => defenseAllowed(player).yards);
  const projections = ordered.map((player) => seasonStats(player).projectionAverage);

  const matchupRows: CompareRow[] = [
    { label: "Opponent", values: ordered.map((player) => player.opponent ?? "-") },
    {
      label: "Matchup Rating",
      values: ordered.map((player) => <Stars key={player.id} rating={matchupRating(player)} />),
      bestIndex: indexOfMax(ordered.map((player) => matchupRating(player))),
    },
    { label: "Rushing Att Allowed", values: attempts, bestIndex: indexOfMax(attempts) },
    { label: "Rushing Yds Allowed", values: yardsAllowed, bestIndex: indexOfMax(yardsAllowed) },
    {
      label: "Rushing TDs Allowed",
      values: ordered.map((player) => defenseAllowed(player).touchdowns),
    },
  ];

  const pointsRows: CompareRow[] = [
    { label: "Season Total", values: ordered.map((player) => seasonStats(player).seasonTotal) },
    { label: "Season Avg.", values: ordered.map((player) => seasonStats(player).seasonAverage) },
    { label: "Projection Avg.", values: projections, bestIndex: indexOfMax(projections) },
    { label: "Consensus Rank", values: ordered.map((player) => `#${rankNumber(player)}`) },
  ];

  const miscRows: CompareRow[] = [
    { label: "Injury Status", values: ordered.map((player) => injuryStatus(player)) },
    { label: "Weather", values: ordered.map((player) => `${weather(player)} F`) },
  ];

  return (
    <div className="overflow-hidden rounded-lg bg-fp-navy">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to player selection"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
          >
            <ChevronDown className="h-5 w-5 rotate-90" />
          </button>
          <h1 className="text-[17px] font-bold text-white">
            Who Should I Start? - {WEEK_LABEL} - {SCORING_LABEL}
          </h1>
        </div>
        <button
          type="button"
          aria-label="Tool settings"
          className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-md bg-[#ededed] text-fp-ink transition-colors hover:bg-white"
        >
          <GearIcon className="h-[18px] w-[18px]" />
        </button>
      </div>

      {signedOut ? (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm">
            <span className="text-fp-muted">{"ⓘ"}</span>
            <button
              type="button"
              className="cursor-pointer font-semibold text-fp-link hover:underline"
            >
              Create an account
            </button>
            <span className="text-fp-ink">to add a third player</span>
          </div>
        </div>
      ) : (
        <PlayerSearch
          pool={pool}
          selectedIds={players.map((player) => player.id)}
          onSelect={onSelect}
          disabled={!canAddPlayer}
          placeholder={searchPlaceholder(players.length)}
        />
      )}

      <LineupControls
        goal={goal}
        onGoalChange={onGoalChange}
        startN={startN}
        onStartNChange={onStartNChange}
        playerCount={players.length}
        isPremium={isPremium}
        gateVariant={gateVariantFor(demoState)}
      />

      <ResultsBand
        recommendation={recommendation}
        onRemove={onRemove}
        canAddPlayer={canAddPlayer}
        onAddPlayer={onBack}
        addPlayerLocked={signedOut}
      />

      <AdviceTabs active={tab} onChange={setTab} />

      <div className="space-y-4 bg-fp-navy-tab py-5">
        {tab === "Overview" ? (
          <>
            <ConsensusSentiment recommendation={recommendation} />
            <SpinTheWheel />
            <CompareModule
              title="Most Accurate Experts"
              rows={expertAccuracyRows}
              playerNames={ordered.map((player) => player.name)}
              footer={isPremium ? undefined : <PremiumFooter />}
            />
            <CompareModule
              title="Sentiment"
              rows={sentimentRows}
              footer={isPremium ? undefined : <PremiumFooter />}
            />
            <CompareModule title="Matchup" rows={matchupRows} />
            <CompareModule title="Fantasy Points" rows={pointsRows} />
            <CompareModule title="Misc" rows={miscRows} />
          </>
        ) : (
          <section className="rounded-lg bg-white px-5 py-10 text-center">
            <p className="text-sm font-semibold text-fp-ink">{tab}</p>
            <p className="mt-1 text-sm text-fp-muted">
              Not rebuilt in this prototype. The existing product already covers it.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
