"use client";

import { CloseIcon, LockIcon, PlayerSilhouette } from "@/components/ui/icons";
import { InjuryTag } from "@/components/ui/injury-tag";
import type { PlayerResult, Recommendation } from "@/lib/engine";

/**
 * The results band as it reads on a phone.
 *
 * A separate component rather than a set of breakpoints on the desktop band, because the
 * desktop band is three different layouts already: a mirrored pair at two players, and a
 * grouped grid from three up, each sized by a shared column formula in `lib/layout`. Those
 * shapes do not survive being narrowed to 295px, and bending them far enough to try would
 * have meant editing the geometry the desktop layout depends on. Only one of the two bands
 * is ever displayed, so nothing here reaches the desktop view.
 *
 * WHAT IT SHOWS IS THE SAME DECISION THE DESKTOP BAND SHOWS, and deliberately so:
 *
 * At one slot every player keeps his own percentage, exactly as the product does today and
 * exactly as the desktop band does, because at one slot the question has not changed and
 * the number is the share of experts who made that player their first choice.
 *
 * Above one slot the recommended players share a single percentage inside one tile. The
 * answer is then a set, and an individual share would describe a player in isolation from
 * the comparison that produced it. The players left out carry no percentage at all, which
 * is the desktop rule too.
 */

/** Colour of a share, matching the desktop ring: green when recommended, grey otherwise. */
const SHARE_GREEN = "#22b45a";
const SHARE_GREY = "#b9bec6";

/** Two players are a pair; three or more are a group. */
function starterNoun(count: number): string {
  if (count === 1) return "him";
  if (count === 2) return "this pair";
  return "this group";
}

function RemoveButton({
  player,
  onRemove,
}: {
  player: PlayerResult["player"];
  onRemove: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onRemove(player.id)}
      aria-label={`Remove ${player.name} from the comparison`}
      className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full text-white/80"
    >
      <CloseIcon className="h-3 w-3" />
    </button>
  );
}

/**
 * One player.
 *
 * The position rank sits on the silhouette the way the product badges a headshot, so the
 * tile carries it without spending one of its three lines of text on it.
 */
function Tile({
  result,
  share,
  recommended,
  onRemove,
}: {
  result: PlayerResult;
  /** Omitted above one slot, where no individual share is meaningful. */
  share?: number;
  recommended: boolean;
  onRemove: (id: string) => void;
}) {
  const { player } = result;

  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center px-0.5 pt-1">
      <RemoveButton player={player} onRemove={onRemove} />

      <div className="relative">
        <PlayerSilhouette className="h-11 w-11 text-white/25" />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-fp-navy-deep px-1 text-[9px] font-semibold text-fp-on-navy">
          {player.posRank}
        </span>
      </div>

      <p className="mt-2 w-full truncate text-center text-[11px] font-bold leading-tight text-white">
        {player.name}
        <InjuryTag playerId={player.id} />
      </p>
      <p className="w-full truncate text-center text-[9px] leading-tight text-fp-on-navy">
        {player.position} - {player.team}
      </p>
      <p className="w-full truncate text-center text-[9px] leading-tight text-fp-on-navy">
        {player.opponent}
      </p>

      {share !== undefined && (
        <p
          className="mt-0.5 text-[15px] font-bold leading-none"
          style={{ color: recommended ? SHARE_GREEN : SHARE_GREY }}
        >
          {share}%
        </p>
      )}
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
    <div className="flex w-8 shrink-0 flex-col items-center justify-center">
      <button
        type="button"
        onClick={onAddPlayer}
        disabled={!canAddPlayer}
        aria-label="Add another player to the comparison"
        className={[
          "flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none",
          canAddPlayer ? "bg-white text-fp-navy" : "bg-white/25 text-white/60",
        ].join(" ")}
      >
        {addPlayerLocked ? <LockIcon className="h-3.5 w-3.5" /> : "+"}
      </button>
    </div>
  );
}

interface ResultsBandMobileProps {
  recommendation: Recommendation;
  onRemove: (playerId: string) => void;
  canAddPlayer: boolean;
  onAddPlayer: () => void;
  addPlayerLocked: boolean;
}

export function ResultsBandMobile({
  recommendation,
  onRemove,
  canAddPlayer,
  onAddPlayer,
  addPlayerLocked,
}: ResultsBandMobileProps) {
  const { results, panelSize, combinationShare, startN } = recommendation;
  if (results.length === 0) return null;

  const starters = results.filter((result) => result.recommended);
  const benched = results.filter((result) => !result.recommended);
  const grouped = startN > 1;
  const groupVotes = Math.round((combinationShare / 100) * panelSize);
  /*
   * `results` is in first-choice order, which is not always selection order: the engine can
   * recommend a player who is not the first-choice leader, and says so. The caption has to
   * name the player actually being recommended, so it reads the starter rather than the row.
   */
  const leader = starters[0];

  return (
    <div className="order-2 bg-fp-navy-slot px-3 py-3 sm:hidden">
      <div className="flex items-stretch gap-1.5">
        {grouped ? (
          <>
            {/* One tile, one percentage: the recommended players are a set, not an order. */}
            <div
              className="flex min-w-0 flex-col rounded-lg bg-[#1f438b] px-1 pb-1.5"
              style={{ flexGrow: starters.length, flexBasis: 0 }}
            >
              <div className="flex min-w-0 items-start">
                {starters.map((result) => (
                  <Tile
                    key={result.player.id}
                    result={result}
                    recommended
                    onRemove={onRemove}
                  />
                ))}
              </div>
              <p
                className="mt-1 text-center text-[17px] font-bold leading-none"
                style={{ color: SHARE_GREEN }}
              >
                {combinationShare}%
              </p>
            </div>
            {benched.map((result) => (
              <Tile
                key={result.player.id}
                result={result}
                recommended={false}
                onRemove={onRemove}
              />
            ))}
          </>
        ) : (
          results.map((result) => (
            <Tile
              key={result.player.id}
              result={result}
              share={result.firstChoiceShare}
              recommended={result.recommended}
              onRemove={onRemove}
            />
          ))
        )}

        {/* Gone once the comparison is full; see the note in `results-band.tsx`. */}
        {(canAddPlayer || addPlayerLocked) && (
          <AddPlayerCell
            canAddPlayer={canAddPlayer}
            addPlayerLocked={addPlayerLocked}
            onAddPlayer={onAddPlayer}
          />
        )}
      </div>

      {/*
        The expert count the desktop band prints beside its ring. On a tile 70px wide there
        is no room for it there, and dropping it would leave a bare percentage with nothing
        to say how many people it counts.
      */}
      {leader && (
        <p className="mt-2 text-center text-[11px] leading-tight text-white">
          <span className="font-bold">
            {grouped ? groupVotes : leader.firstChoiceVotes} of {panelSize}
          </span>{" "}
          experts start {grouped ? starterNoun(starters.length) : leader.player.name}
        </p>
      )}
    </div>
  );
}
