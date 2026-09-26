"use client";

import { CloseIcon, LockIcon, PlayerSilhouette } from "@/components/ui/icons";
import { PercentageBadge, PercentageRing } from "@/components/wsis/advice/percentage-ring";
import type { PlayerResult, Recommendation } from "@/lib/engine";
import { bandColumns } from "@/lib/layout";
import type { Player } from "@/lib/types";

const POSITION_TEXT: Record<string, string> = {
  QB: "text-[#c58cf0]",
  RB: "text-[#6ea8ff]",
  WR: "text-[#5fd08a]",
  TE: "text-[#ffa05c]",
  K: "text-[#5fc8dd]",
  DST: "text-[#aab3c2]",
};

const positionText = (position: string) => POSITION_TEXT[position] ?? "text-[#aab3c2]";

function RemoveButton({ player, onRemove }: { player: Player; onRemove: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onRemove(player.id)}
      aria-label={`Remove ${player.name} from the comparison`}
      className="absolute right-3 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white"
    >
      <CloseIcon className="h-4 w-4" />
    </button>
  );
}

function StartPill() {
  return (
    <span className="rounded-full bg-[#22b45a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
      Start
    </span>
  );
}

/**
 * The two numbers, one above the other.
 *
 * The ring is the share of experts who made this player their single first choice, which
 * is what the tool shows today. Beneath it, once more than one slot is being filled, sits
 * the share who would actually start him.
 *
 * They answer different questions and they are on different scales: first choices total
 * 100 across a comparison, while start shares total roughly N times that. Showing one and
 * hiding the other is what lets the current display be read as a ranking.
 */
function Numbers({
  result,
  startN,
  total,
}: {
  result: PlayerResult;
  startN: number;
  total: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <PercentageRing share={result.firstChoiceShare} leading={result.recommended} />
      <p className="whitespace-nowrap text-[11px] text-white">
        <span className="font-bold">
          {result.firstChoiceVotes} of {total}
        </span>{" "}
        first choice
      </p>
      {startN > 1 && (
        <p
          className={`whitespace-nowrap text-[11px] font-semibold ${
            result.recommended ? "text-[#22b45a]" : "text-fp-on-navy"
          }`}
        >
          {result.inclusionShare}% would start
        </p>
      )}
    </div>
  );
}

function LeaderCard({
  result,
  startN,
  total,
  onRemove,
}: {
  result: PlayerResult;
  startN: number;
  total: number;
  onRemove: (id: string) => void;
}) {
  const { player } = result;
  return (
    <div className="relative flex h-[200px] min-w-0 flex-1 items-end gap-4 overflow-hidden bg-[#1f438b] px-5 pt-4">
      <RemoveButton player={player} onRemove={onRemove} />
      <PlayerSilhouette className="-mb-6 h-40 w-40 shrink-0 text-white/25" />
      <div className="flex min-w-0 flex-1 flex-col items-end pb-4">
        {startN > 1 && result.recommended && <StartPill />}
        <p className="mt-1 text-right text-[22px] font-bold leading-tight text-white">
          {player.name}
        </p>
        <p className="mt-3 whitespace-nowrap text-[13px] text-white/90">
          {player.position} - {player.team}
        </p>
        <p className="whitespace-nowrap text-[13px] text-white/90">{player.opponent}</p>
      </div>
      <div className="shrink-0 pb-4">
        <Numbers result={result} startN={startN} total={total} />
      </div>
    </div>
  );
}

function RunnerUpCard({
  result,
  startN,
  total,
  onRemove,
}: {
  result: PlayerResult;
  startN: number;
  total: number;
  onRemove: (id: string) => void;
}) {
  const { player } = result;
  return (
    <div className="relative flex h-[200px] min-w-0 flex-1 items-end gap-4 overflow-hidden px-5 pt-4">
      <RemoveButton player={player} onRemove={onRemove} />
      <div className="shrink-0 pb-4">
        <Numbers result={result} startN={startN} total={total} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start pb-4">
        {startN > 1 && result.recommended && <StartPill />}
        <p className="mt-1 text-[22px] font-bold leading-tight text-white">{player.name}</p>
        <p className="mt-3 whitespace-nowrap text-[13px] text-white/90">
          {player.position} - {player.team}
        </p>
        <p className="whitespace-nowrap text-[13px] text-white/90">{player.opponent}</p>
      </div>
      <PlayerSilhouette className="-mb-6 h-40 w-40 shrink-0 text-white/25" />
    </div>
  );
}

function CompactCard({
  result,
  startN,
  onRemove,
}: {
  result: PlayerResult;
  startN: number;
  onRemove: (id: string) => void;
}) {
  const { player } = result;
  return (
    <div className="relative flex h-[200px] min-w-0 flex-1 flex-col items-center gap-1 overflow-hidden border-l border-white/10 px-3 pt-4">
      <RemoveButton player={player} onRemove={onRemove} />
      <PercentageBadge share={result.firstChoiceShare} />
      <p className="text-center text-[15px] font-bold leading-tight text-white">{player.name}</p>
      <p className={`text-[11px] font-medium ${positionText(player.position)}`}>
        {player.position} - {player.team}
      </p>
      {startN > 1 && (
        <p
          className={`text-[11px] font-semibold ${
            result.recommended ? "text-[#22b45a]" : "text-fp-on-navy"
          }`}
        >
          {result.inclusionShare}% would start
        </p>
      )}
      {startN > 1 && result.recommended && <StartPill />}
      <PlayerSilhouette className="-mb-4 mt-auto h-16 w-16 text-white/25" />
    </div>
  );
}

function AddPlayerCell({
  canAddPlayer,
  addPlayerLocked,
  onAddPlayer,
}: {
  canAddPlayer: boolean;
  addPlayerLocked: boolean;
  onAddPlayer: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-3">
      <p className="text-center text-[15px] font-bold leading-tight text-white">
        Add
        <br />
        Player
      </p>
      <button
        type="button"
        onClick={onAddPlayer}
        disabled={!canAddPlayer}
        aria-label="Add another player to the comparison"
        className={[
          "flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none",
          canAddPlayer
            ? "cursor-pointer bg-white text-fp-navy hover:bg-fp-blue hover:text-white"
            : "cursor-not-allowed bg-white/25 text-white/60",
        ].join(" ")}
      >
        {addPlayerLocked ? <LockIcon className="h-4 w-4" /> : "+"}
      </button>
    </div>
  );
}

interface ResultsBandProps {
  recommendation: Recommendation;
  onRemove: (playerId: string) => void;
  /** False when the state cannot add another player, e.g. signed out at two. */
  canAddPlayer: boolean;
  onAddPlayer: () => void;
  /** Rendered with a padlock rather than hidden, so the limit stays visible. */
  addPlayerLocked: boolean;
}

/**
 * The results header.
 *
 * Two layouts, matching the product. With exactly two players the cards mirror each other
 * at equal weight. From three up the leading player keeps a double-width card and the rest
 * collapse into single-width ones, sharing a grid with the comparison tables below so each
 * card sits directly above its own column.
 */
export function ResultsBand({
  recommendation,
  onRemove,
  canAddPlayer,
  onAddPlayer,
  addPlayerLocked,
}: ResultsBandProps) {
  const { results, startN, panelSize } = recommendation;
  const [leader, ...rest] = results;
  if (!leader) return null;

  if (results.length === 2) {
    return (
      <div className="flex items-stretch bg-fp-navy-slot">
        <LeaderCard result={leader} startN={startN} total={panelSize} onRemove={onRemove} />
        <RunnerUpCard result={rest[0]} startN={startN} total={panelSize} onRemove={onRemove} />
        <AddPlayerCell
          canAddPlayer={canAddPlayer}
          addPlayerLocked={addPlayerLocked}
          onAddPlayer={onAddPlayer}
        />
      </div>
    );
  }

  return (
    <div
      className="grid items-stretch bg-fp-navy-slot"
      style={{ gridTemplateColumns: bandColumns(results.length) }}
    >
      <LeaderCard result={leader} startN={startN} total={panelSize} onRemove={onRemove} />
      {rest.map((result) => (
        <CompactCard key={result.player.id} result={result} startN={startN} onRemove={onRemove} />
      ))}
      <AddPlayerCell
        canAddPlayer={canAddPlayer}
        addPlayerLocked={addPlayerLocked}
        onAddPlayer={onAddPlayer}
      />
    </div>
  );
}
