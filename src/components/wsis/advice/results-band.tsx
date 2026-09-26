"use client";

import { CloseIcon, LockIcon, PlayerSilhouette } from "@/components/ui/icons";
import { InjuryTag } from "@/components/ui/injury-tag";
import { PercentageRing } from "@/components/wsis/advice/percentage-ring";
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

/** Two players are a pair; three or more are a group. */
function starterNoun(count: number): string {
  if (count === 1) return "him";
  if (count === 2) return "this pair";
  return "this group";
}

function RemoveButton({ player, onRemove }: { player: Player; onRemove: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onRemove(player.id)}
      aria-label={`Remove ${player.name} from the comparison`}
      className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white"
    >
      <CloseIcon className="h-4 w-4" />
    </button>
  );
}

function PlayerMeta({ player, align }: { player: Player; align: "left" | "right" | "center" }) {
  const alignment =
    align === "right" ? "items-end text-right" : align === "left" ? "items-start" : "items-center text-center";
  return (
    <div className={`flex min-w-0 flex-col ${alignment}`}>
      <p className="text-[20px] font-bold leading-tight text-white">
        {player.name}
        <InjuryTag playerId={player.id} />
      </p>
      <p className="mt-2 whitespace-nowrap text-[13px] text-white/90">
        {player.position} - {player.team}
      </p>
      <p className="whitespace-nowrap text-[13px] text-white/90">{player.opponent}</p>
    </div>
  );
}

/**
 * One tile inside the recommended group.
 *
 * Every recommended player gets the same tile. They are a set, not an order: the tool was
 * asked which players to start, not which is better, so ranking them against each other
 * would answer a question nobody asked.
 */
function StarterTile({
  result,
  onRemove,
}: {
  result: PlayerResult;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="relative flex h-full min-w-0 flex-col items-center justify-end gap-1 overflow-hidden px-3 pb-4 pt-4">
      <RemoveButton player={result.player} onRemove={onRemove} />
      <PlayerSilhouette className="h-16 w-16 shrink-0 text-white/25" />
      <PlayerMeta player={result.player} align="center" />
    </div>
  );
}

/**
 * A player the recommendation leaves out.
 *
 * No percentage: the answer is the set, and his honest figures are pair-dependent, so any
 * single number on his card alone would misstate them. Headshot above the name, matching
 * the recommended tiles, at a smaller scale to keep the hierarchy. The live product puts
 * the headshot below on its non-leading cards; the inconsistency reads as a mistake here,
 * so the prototype is deliberately tidier than the thing it copies.
 */
function BenchedTile({
  result,
  onRemove,
}: {
  result: PlayerResult;
  onRemove: (id: string) => void;
}) {
  const { player } = result;
  return (
    <div className="relative flex h-full min-w-0 flex-col items-center justify-end gap-1 overflow-hidden border-l border-white/10 px-3 pb-4 pt-4 opacity-70">
      <RemoveButton player={player} onRemove={onRemove} />
      <PlayerSilhouette className="h-12 w-12 shrink-0 text-white/20" />
      <p className="text-center text-[15px] font-bold leading-tight text-white">
        {player.name}
        <InjuryTag playerId={player.id} />
      </p>
      <p className={`mt-1 text-[11px] font-medium ${positionText(player.position)}`}>
        {player.position} - {player.team}
      </p>
      <p className="text-[11px] text-fp-on-navy">{player.opponent}</p>
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

/* -------------------------------------------------------------------------- */
/* Two players: the product's mirrored layout, left untouched                  */
/* -------------------------------------------------------------------------- */

function MirroredPair({
  results,
  panelSize,
  onRemove,
}: {
  results: PlayerResult[];
  panelSize: number;
  onRemove: (id: string) => void;
}) {
  const [leader, other] = results;
  return (
    <>
      <div className="relative flex h-[200px] min-w-0 flex-1 items-end gap-4 overflow-hidden bg-[#1f438b] px-5 pt-4">
        <RemoveButton player={leader.player} onRemove={onRemove} />
        <PlayerSilhouette className="-mb-6 h-40 w-40 shrink-0 text-white/25" />
        <div className="flex min-w-0 flex-1 flex-col items-end pb-4">
          <PlayerMeta player={leader.player} align="right" />
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1.5 pb-4">
          <PercentageRing share={leader.firstChoiceShare} leading />
          <p className="whitespace-nowrap text-[11px] text-white">
            <span className="font-bold">
              {leader.firstChoiceVotes} of {panelSize}
            </span>{" "}
            experts
          </p>
        </div>
      </div>

      <div className="relative flex h-[200px] min-w-0 flex-1 items-end gap-4 overflow-hidden px-5 pt-4">
        <RemoveButton player={other.player} onRemove={onRemove} />
        <div className="flex shrink-0 flex-col items-center gap-1.5 pb-4">
          <PercentageRing share={other.firstChoiceShare} leading={false} />
          <p className="whitespace-nowrap text-[11px] text-white">
            <span className="font-bold">
              {other.firstChoiceVotes} of {panelSize}
            </span>{" "}
            experts
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start pb-4">
          <PlayerMeta player={other.player} align="left" />
        </div>
        <PlayerSilhouette className="-mb-6 h-40 w-40 shrink-0 text-white/25" />
      </div>
    </>
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
 * Two players keep the product's mirrored layout. From three up, the players the tool
 * recommends are joined into one tile and share a single percentage: the share of experts
 * whose own top N is exactly that set.
 *
 * That percentage is not a new measure. At one slot it returns the number the product
 * already shows, because the existing percentage is this one with N fixed at one. Asking
 * for two slots changes the question, and the answer becomes a group rather than a winner,
 * so the group is what the layout presents.
 */
export function ResultsBand({
  recommendation,
  onRemove,
  canAddPlayer,
  onAddPlayer,
  addPlayerLocked,
}: ResultsBandProps) {
  const { results, panelSize, combinationShare } = recommendation;
  if (results.length === 0) return null;

  if (results.length === 2) {
    return (
      <div className="flex items-stretch bg-fp-navy-slot">
        <MirroredPair results={results} panelSize={panelSize} onRemove={onRemove} />
        <AddPlayerCell
          canAddPlayer={canAddPlayer}
          addPlayerLocked={addPlayerLocked}
          onAddPlayer={onAddPlayer}
        />
      </div>
    );
  }

  const starters = results.filter((result) => result.recommended);
  const benched = results.filter((result) => !result.recommended);
  const groupSpan = starters.length + 1;

  return (
    <div
      className="grid h-[200px] items-stretch bg-fp-navy-slot"
      style={{ gridTemplateColumns: bandColumns(results.length) }}
    >
      {/* The recommended set: one tile, one percentage, equal weight inside. */}
      <div
        className="grid bg-[#1f438b]"
        style={{ gridColumn: `1 / span ${groupSpan}`, gridTemplateColumns: `repeat(${groupSpan}, 1fr)` }}
      >
        <div className="flex flex-col items-center justify-center gap-1.5 px-2">
          <PercentageRing share={combinationShare} leading />
          <p className="text-center text-[11px] leading-tight text-white">
            <span className="font-bold">
              {Math.round((combinationShare / 100) * panelSize)} of {panelSize}
            </span>{" "}
            experts
            <br />
            start {starterNoun(starters.length)}
          </p>
        </div>
        {starters.map((result) => (
          <StarterTile key={result.player.id} result={result} onRemove={onRemove} />
        ))}
      </div>

      {benched.map((result) => (
        <BenchedTile key={result.player.id} result={result} onRemove={onRemove} />
      ))}

      <AddPlayerCell
        canAddPlayer={canAddPlayer}
        addPlayerLocked={addPlayerLocked}
        onAddPlayer={onAddPlayer}
      />
    </div>
  );
}
