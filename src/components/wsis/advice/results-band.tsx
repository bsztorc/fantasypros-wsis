"use client";

import { CloseIcon, LockIcon, PlayerSilhouette } from "@/components/ui/icons";
import { PercentageBadge, PercentageRing } from "@/components/wsis/advice/percentage-ring";
import type { Consensus, ExpertVote } from "@/lib/consensus";
import type { Player, Position } from "@/lib/types";

const POSITION_TEXT: Record<Position, string> = {
  QB: "text-[#c58cf0]",
  RB: "text-[#6ea8ff]",
  WR: "text-[#5fd08a]",
  TE: "text-[#ffa05c]",
  K: "text-[#5fc8dd]",
  DST: "text-[#aab3c2]",
};

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

function ExpertCount({ votes, total }: { votes: number; total: number }) {
  return (
    <p className="text-[11px] text-white">
      <span className="font-bold">
        {votes} of {total}
      </span>{" "}
      experts
    </p>
  );
}

/** The emphasised card: the player most experts picked first. */
function LeaderCard({
  vote,
  total,
  onRemove,
  mirrored = false,
}: {
  vote: ExpertVote;
  total: number;
  onRemove: (id: string) => void;
  mirrored?: boolean;
}) {
  const { player, share } = vote;

  return (
    <div
      className={[
        "relative flex h-[190px] min-w-0 flex-1 items-end gap-4 overflow-hidden bg-[#1f438b] px-5 pt-4",
        mirrored ? "flex-row-reverse" : "",
      ].join(" ")}
    >
      <RemoveButton player={player} onRemove={onRemove} />
      <PlayerSilhouette className="-mb-6 h-40 w-40 shrink-0 text-white/25" />

      <div className={["flex min-w-0 flex-1 flex-col pb-4", mirrored ? "items-start" : "items-end"].join(" ")}>
        <p className={["text-[22px] font-bold leading-tight text-white", mirrored ? "text-left" : "text-right"].join(" ")}>
          {player.name}
        </p>
        <p className="mt-6 whitespace-nowrap text-[13px] text-white/90">
          {player.position} - {player.team}
        </p>
        <p className="whitespace-nowrap text-[13px] text-white/90">{player.opponent} Sun 1pm ET</p>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1.5 pb-4">
        <PercentageRing share={share} leading />
        <ExpertCount votes={vote.votes} total={total} />
      </div>
    </div>
  );
}

/** The mirrored second card, used only when exactly two players are compared. */
function RunnerUpCard({
  vote,
  total,
  onRemove,
}: {
  vote: ExpertVote;
  total: number;
  onRemove: (id: string) => void;
}) {
  const { player, share } = vote;

  return (
    <div className="relative flex h-[190px] min-w-0 flex-1 items-end gap-4 overflow-hidden px-5 pt-4">
      <RemoveButton player={player} onRemove={onRemove} />

      <div className="flex shrink-0 flex-col items-center gap-1.5 pb-4">
        <PercentageRing share={share} leading={false} />
        <ExpertCount votes={vote.votes} total={total} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start pb-4">
        <p className="text-[22px] font-bold leading-tight text-white">{player.name}</p>
        <p className="mt-6 whitespace-nowrap text-[13px] text-white/90">
          {player.position} - {player.team}
        </p>
        <p className="whitespace-nowrap text-[13px] text-white/90">{player.opponent} Sun 1pm ET</p>
      </div>

      <PlayerSilhouette className="-mb-6 h-40 w-40 shrink-0 text-white/25" />
    </div>
  );
}

/** The compact card used for every non-leading player once three or more are compared. */
function CompactCard({
  vote,
  onRemove,
}: {
  vote: ExpertVote;
  onRemove: (id: string) => void;
}) {
  const { player, share } = vote;

  return (
    <div className="relative flex h-[190px] min-w-0 flex-1 flex-col items-center gap-1.5 overflow-hidden border-l border-white/10 px-3 pt-4">
      <RemoveButton player={player} onRemove={onRemove} />
      <PercentageBadge share={share} />
      <p className="text-center text-[15px] font-bold leading-tight text-white">{player.name}</p>
      <p className={`text-[11px] font-medium ${POSITION_TEXT[player.position]}`}>
        {player.position} - {player.team}
      </p>
      <PlayerSilhouette className="-mb-4 mt-auto h-20 w-20 text-white/25" />
    </div>
  );
}

interface ResultsBandProps {
  consensus: Consensus;
  onRemove: (playerId: string) => void;
  /** False when the state cannot add another player, e.g. signed out at two. */
  canAddPlayer: boolean;
  onAddPlayer: () => void;
  /** Rendered with a padlock rather than hidden, so the limit is visible. */
  addPlayerLocked: boolean;
}

/**
 * The results header.
 *
 * The product uses two layouts. With exactly two players the cards mirror each other at
 * equal weight. From three players up, the leading player keeps the large card and the
 * rest collapse into compact ones, which is precisely the visual hierarchy that invites
 * the ordering to be read as a ranking.
 */
export function ResultsBand({
  consensus,
  onRemove,
  canAddPlayer,
  onAddPlayer,
  addPlayerLocked,
}: ResultsBandProps) {
  const [leader, ...rest] = consensus.votes;
  if (!leader) return null;

  const isPair = consensus.votes.length === 2;

  return (
    <div className="flex items-stretch bg-fp-navy-slot">
      <LeaderCard vote={leader} total={consensus.totalExperts} onRemove={onRemove} />

      {isPair ? (
        <RunnerUpCard vote={rest[0]} total={consensus.totalExperts} onRemove={onRemove} />
      ) : (
        rest.map((vote) => <CompactCard key={vote.player.id} vote={vote} onRemove={onRemove} />)
      )}

      {(canAddPlayer || addPlayerLocked) && (
        <div className="flex w-[104px] shrink-0 flex-col items-center justify-center gap-2 px-3">
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
      )}
    </div>
  );
}
