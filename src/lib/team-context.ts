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
  /** No player on the roster kicks off later, so waiting on him costs the whole week. */
  isLastOfWeek: boolean;
  /** The roster holds someone else at his position, whether or not they have played. */
  hasBenchAtPosition: boolean;
  /**
   * Everyone else at the position kicked off before this game.
   *
   * The decisive fact. A replacement whose game has already started is not a replacement:
   * the user cannot wait for the news and then act on it, so cover that has played is the
   * same as no cover at all.
   */
  benchAlreadyPlayed: boolean;
  /** The same, across the whole roster rather than just his position. */
  wholeRosterAlreadyPlayed: boolean;
  /** Someone at the position is still to play and carries no designation of their own. */
  hasCleanCover: boolean;
  /** Cover exists but every one of them is carrying a designation too. */
  allCoverUnresolved: boolean;
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
  const others = MY_ROSTER.filter((player) => player.id !== top.player.id);
  const bench = others.filter((player) => player.position === top.player.position);
  const benchStillToPlay = bench.filter((player) => (player.kickoff ?? 0) >= kickoff);

  // Cover has to be someone who is themselves available. A questionable replacement for a
  // questionable starter is not a plan, it is the same problem twice.
  const clean = benchStillToPlay.filter((player) => designationFor(player.id) === null);
  const latestOnRoster = Math.max(...MY_ROSTER.map((player) => player.kickoff ?? 0));

  return {
    player: top.player,
    wording: DESIGNATION_WORDING[top.designation],
    slot,
    isLastOfWeek: kickoff >= latestOnRoster,
    hasBenchAtPosition: bench.length > 0,
    benchAlreadyPlayed: bench.length > 0 && benchStillToPlay.length === 0,
    wholeRosterAlreadyPlayed: others.every((player) => (player.kickoff ?? 0) < kickoff),
    hasCleanCover: clean.length > 0,
    allCoverUnresolved: benchStillToPlay.length > 0 && clean.length === 0,
  };
}

/**
 * The availability risk as a sentence.
 *
 * Names nobody but the player in question. An earlier version named the best cover on the
 * bench, which reads as a recommendation to go and start that player: a second piece of
 * advice, attached to a decision the user did not ask about, in the middle of the answer to
 * the one they did.
 *
 * It states the designation, when it resolves, and whether the roster can cover it. It stops
 * there. It does not predict whether he plays, because nothing in this snapshot knows, and a
 * recommendation dressed up as foresight is the failure this prototype is arguing against.
 */
export function availabilityNote(risk: AvailabilityRisk): string {
  const {
    player,
    wording,
    slot,
    isLastOfWeek,
    hasBenchAtPosition,
    benchAlreadyPlayed,
    wholeRosterAlreadyPlayed,
    hasCleanCover,
    allCoverUnresolved,
  } = risk;

  const noun = nounFor(player.position);
  const closer = ` His injury situation is worth considering.`;

  const timing = isLastOfWeek
    ? ` Note for your team: ${player.name} is ${wording} to play ${slot}, the last game of` +
      ` your week.`
    : ` Note for your team: ${player.name} is ${wording} to play ${slot}.`;

  if (!hasBenchAtPosition) {
    return `${timing} You have no other ${noun} on your roster to replace him with.${closer}`;
  }

  if (benchAlreadyPlayed) {
    // Only claim the whole roster when the whole roster is true of it. On this snapshot a
    // running back is in the same Monday night game, so the unqualified version is wrong.
    const scope = wholeRosterAlreadyPlayed ? "player" : noun;
    return (
      `${timing} Every other ${scope} on your roster has already played by then, so if he is` +
      ` ruled out you'll have no players to replace him with.${closer}`
    );
  }

  if (allCoverUnresolved) {
    return (
      `${timing} Every ${noun} on your bench who is still to play is carrying a designation of` +
      ` his own, so there is no clean replacement to fall back on.${closer}`
    );
  }

  if (hasCleanCover) {
    return (
      `${timing} If he is ruled out you have cover at the position that has not played yet.` +
      `${closer}`
    );
  }

  return `${timing} You have no other ${noun} on your roster to replace him with.${closer}`;
}
