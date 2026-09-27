import { MY_ROSTER } from "@/lib/fixtures/roster";
import { DESIGNATION_WORDING, designationFor, isRuledOut } from "@/lib/injuries";
import type { RankedPlayer } from "@/lib/rankings";

/**
 * Reasoning that needs the user's team, not just the players being compared.
 *
 * Everything here is gated on league sync, because everything here reads the roster. An
 * unsynced user has no roster, so there is nothing to say and the summary says nothing
 * rather than inventing a bench.
 *
 * REVERSAL, DELIBERATE: an earlier pass recorded team-aware reasoning as not worth
 * building, on the grounds that final rosters are announced ninety minutes before kickoff
 * and that kills the reassuring half of it. That argument still holds for the reassuring
 * half and is why none of this tells the user a player will be fine. What it does is state
 * the part that is already knowable and that the product currently drops on the floor: a
 * designation that will not resolve until after the rest of the user's week has finished,
 * and what is actually behind that player on their own bench.
 */

/**
 * Kickoff read in US Eastern time.
 *
 * The snapshot stores kickoff as a Unix timestamp. Eastern is the league's scheduling
 * timezone, so a fixed offset is enough here: the regular season runs entirely inside
 * daylight time until early November, and this snapshot is Week 3.
 */
const EASTERN_OFFSET_SECONDS = -4 * 3600;

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * When a player's game kicks off, as a manager would say it.
 *
 * Null when the snapshot has no kickoff for him, which is possible and must not be papered
 * over: a sentence about when a game starts is worthless if the time is a guess.
 */
export function kickoffSlot(player: RankedPlayer): string | null {
  if (!player.kickoff) return null;

  const eastern = new Date((player.kickoff + EASTERN_OFFSET_SECONDS) * 1000);
  const day = DAY_NAMES[eastern.getUTCDay()];
  const hour = eastern.getUTCHours();

  if (hour >= 19) return `${day} night`;
  if (hour >= 16) return `${day} late afternoon`;
  if (hour >= 12) return `${day} afternoon`;
  return `${day} morning`;
}

const positionalRank = (player: RankedPlayer) =>
  Number(String(player.posRank).replace(/\D/g, "")) || Number.MAX_SAFE_INTEGER;

/** The position, as a manager would say it rather than as a table column. */
const POSITION_NOUN: Record<string, string> = {
  QB: "quarterback",
  RB: "running back",
  WR: "receiver",
  TE: "tight end",
  K: "kicker",
  DST: "defense",
};

const nounFor = (position: string) => POSITION_NOUN[position] ?? position;

export interface AvailabilityRisk {
  player: RankedPlayer;
  /** "questionable" or "doubtful". Never a settled status: see below. */
  wording: string;
  slot: string;
  /** No other player on the roster kicks off later, so waiting costs the whole week. */
  isLastOfWeek: boolean;
  /**
   * Best player at the position, on the roster, not in the comparison, still to kick off.
   *
   * Still to kick off is the part that matters. A replacement whose game has already
   * started is not a replacement: the user cannot wait for the news and then use him, so
   * naming him as cover would be advice they cannot act on.
   */
  cover: RankedPlayer | null;
  /** Everyone at the position still to play carries a designation of their own. */
  allCoverUnresolved: boolean;
  /** How far below the risky player the cover is ranked, in places at the position. */
  rankGap: number;
  /** Best player at the position on the bench, whether or not his game has started. */
  bestOnBench: RankedPlayer | null;
  /** True when every other player at the position has kicked off before this game. */
  benchAlreadyPlayed: boolean;
}

/**
 * The availability risk worth raising, if there is one.
 *
 * Only unresolved designations qualify. A player who is out, suspended or on injured
 * reserve poses no decision: the user can see he is not playing, and the tool telling them
 * so adds nothing. Questionable and doubtful are the ones that sit unresolved, which is the
 * top concern in the start/sit requests the research sampled.
 *
 * Among candidates the recommended players come first, because a risk attached to a player
 * the tool just told them to start is the one that changes what they do.
 */
export function availabilityRisk(
  compared: RankedPlayer[],
  recommendedIds: Set<string>,
): AvailabilityRisk | null {
  const candidates = compared
    .map((player) => ({ player, designation: designationFor(player.id) }))
    .filter((entry) => entry.designation !== null && !isRuledOut(entry.designation))
    .sort((a, b) => {
      const byRecommended =
        Number(recommendedIds.has(b.player.id)) - Number(recommendedIds.has(a.player.id));
      if (byRecommended !== 0) return byRecommended;
      return (b.player.kickoff ?? 0) - (a.player.kickoff ?? 0);
    });

  const top = candidates[0];
  if (!top || !top.designation) return null;

  const slot = kickoffSlot(top.player);
  if (!slot) return null;

  const kickoff = top.player.kickoff ?? 0;
  const comparedIds = new Set(compared.map((player) => player.id));
  const bench = MY_ROSTER.filter(
    (player) => player.position === top.player.position && !comparedIds.has(player.id),
  ).sort((a, b) => positionalRank(a) - positionalRank(b));

  const stillToPlay = bench.filter((player) => (player.kickoff ?? 0) >= kickoff);

  // Cover has to be someone who is themselves available. A questionable replacement for a
  // questionable starter is not a plan, it is the same problem twice.
  const clean = stillToPlay.filter((player) => designationFor(player.id) === null);
  const cover = clean[0] ?? null;
  const latestOnRoster = Math.max(...MY_ROSTER.map((player) => player.kickoff ?? 0));

  return {
    player: top.player,
    wording: DESIGNATION_WORDING[top.designation],
    slot,
    isLastOfWeek: kickoff >= latestOnRoster,
    cover,
    allCoverUnresolved: stillToPlay.length > 0 && clean.length === 0,
    rankGap: cover ? positionalRank(cover) - positionalRank(top.player) : 0,
    bestOnBench: bench[0] ?? null,
    benchAlreadyPlayed: bench.length > 0 && stillToPlay.length === 0,
  };
}

/**
 * The availability risk as a sentence.
 *
 * States the designation, when it resolves, and what the user's own bench can actually do
 * about it. It stops there. It does not predict whether he plays, because nothing in this
 * snapshot knows, and a recommendation dressed up as foresight is the failure this whole
 * prototype is arguing against.
 */
export function availabilityNote(risk: AvailabilityRisk): string {
  const {
    player,
    wording,
    slot,
    isLastOfWeek,
    cover,
    allCoverUnresolved,
    rankGap,
    bestOnBench,
    benchAlreadyPlayed,
  } = risk;
  const noun = nounFor(player.position);

  const timing = isLastOfWeek
    ? `${player.name} is ${wording} and plays ${slot}, the last game of your week.`
    : `${player.name} is ${wording} and does not play until ${slot}.`;

  if (!bestOnBench) {
    return ` On your roster: ${timing} You have no other ${noun} to replace him with.`;
  }

  if (benchAlreadyPlayed) {
    return (
      ` On your roster: ${timing} Every other ${noun} you roster has already played by then,` +
      ` ${bestOnBench.name} at ${bestOnBench.posRank} included, so if he is ruled out there is` +
      ` nothing left to put in the slot.`
    );
  }

  if (allCoverUnresolved) {
    return (
      ` On your roster: ${timing} Every ${noun} on your bench who is still to play is carrying` +
      ` a designation of his own, so there is no clean replacement to fall back on.`
    );
  }

  if (!cover) {
    return ` On your roster: ${timing} You have no other ${noun} to replace him with.`;
  }

  if (rankGap >= 20) {
    return (
      ` On your roster: ${timing} If he is ruled out, the best cover still to play is` +
      ` ${cover.name} at ${cover.posRank}, ${rankGap} places lower, so there is no` +
      ` like-for-like replacement here.`
    );
  }

  return (
    ` On your roster: ${timing} If he is ruled out, ${cover.name} at ${cover.posRank} is still` +
    ` to play and can take the slot, ${rankGap} places lower.`
  );
}
