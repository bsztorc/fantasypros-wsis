"use client";

import { useState } from "react";
import { ChevronDown, GearIcon } from "@/components/ui/icons";
import { AdviceTabs, type AdviceTab } from "@/components/wsis/advice/advice-tabs";
import {
  CompareModule,
  LockedValue,
  PremiumFooter,
  Stars,
  type CompareRow,
} from "@/components/wsis/advice/compare-module";
import { ConsensusSentiment } from "@/components/wsis/advice/consensus-sentiment";
import { ResultsBand } from "@/components/wsis/advice/results-band";
import { SentimentMeter } from "@/components/wsis/advice/sentiment-meter";
import { SpinTheWheel } from "@/components/wsis/advice/spin-the-wheel";
import { PlayerSearch } from "@/components/wsis/player-search";
import { computeConsensus } from "@/lib/consensus";
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
import type { DemoState, Player } from "@/lib/types";

interface AdviceViewProps {
  players: Player[];
  demoState: DemoState;
  /** Slots this state allows, which caps how many players can be compared. */
  openSlots: number;
  /** Premium unlocks the Sentiment meters that Lineup Goal reads. */
  isPremium: boolean;
  /** Everything the current demo state lets the user search. */
  pool: Player[];
  onSelect: (player: Player) => void;
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
 * The advice view: what the tool shows after View Advice.
 *
 * This is the current product experience rebuilt. The lineup-aware recommendation only
 * has something to say above two players, and the signed-out state cannot get there,
 * which is the point of demonstrating it here first.
 */
export function AdviceView({
  players,
  demoState,
  openSlots,
  isPremium,
  pool,
  onSelect,
  onBack,
  onRemove,
}: AdviceViewProps) {
  const [tab, setTab] = useState<AdviceTab>("Overview");
  const consensus = computeConsensus(players);
  const ordered = consensus.votes.map((vote) => vote.player);
  const signedOut = demoState === "signed-out";
  const canAddPlayer = players.length < openSlots;

  const matchupRows: CompareRow[] = [
    { label: "Opponent", values: ordered.map((player) => player.opponent) },
    {
      label: "Matchup Rating",
      values: ordered.map((player) => <Stars key={player.id} rating={matchupRating(player)} />),
    },
    { label: "Rushing Att Allowed", values: ordered.map((player) => defenseAllowed(player).attempts) },
    { label: "Rushing Yds Allowed", values: ordered.map((player) => defenseAllowed(player).yards) },
    { label: "Rushing TDs Allowed", values: ordered.map((player) => defenseAllowed(player).touchdowns) },
  ];

  const pointsRows: CompareRow[] = [
    { label: "Season Total", values: ordered.map((player) => seasonStats(player).seasonTotal) },
    { label: "Season Avg.", values: ordered.map((player) => seasonStats(player).seasonAverage) },
    { label: "Projection Avg.", values: ordered.map((player) => seasonStats(player).projectionAverage) },
    { label: "2025 Avg.", values: ordered.map((player) => seasonStats(player).priorYearAverage) },
  ];

  const expertAccuracyRows: CompareRow[] = ["Top Overall Experts", "Top Position Experts", "Top Player Experts"].map(
    (label, index) => ({
      label,
      values: ordered.map((player) =>
        isPremium ? (
          <span key={player.id}>#{rankNumber(player) + index}</span>
        ) : (
          <LockedValue key={player.id} />
        ),
      ),
    }),
  );

  const sentimentRows: CompareRow[] = [
    {
      label: "Overall",
      values: ordered.map((player) => <SentimentMeter key={player.id} value={sentimentOverall(player)} />),
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

      <ResultsBand
        consensus={consensus}
        onRemove={onRemove}
        canAddPlayer={canAddPlayer}
        onAddPlayer={onBack}
        addPlayerLocked={signedOut}
      />

      <AdviceTabs active={tab} onChange={setTab} />

      <div className="space-y-4 bg-fp-navy-tab px-5 py-5">
        {tab === "Overview" ? (
          <>
            {consensus.votes.length === 2 && <ConsensusSentiment consensus={consensus} />}
            <SpinTheWheel />
            <CompareModule
              title="Most Accurate Experts"
              rows={expertAccuracyRows}
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
