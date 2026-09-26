import snapshot from "@/lib/fixtures/rankings-week3.json";

/**
 * A player as a ranking list knows them.
 *
 * `average`, `best`, `worst` and `deviation` describe how the expert panel disagreed about
 * this player, which is what the recommendation engine needs. They are real values from
 * FantasyPros' published Week 3 consensus.
 */
export interface RankedPlayer {
  id: string;
  name: string;
  fullName: string;
  position: string;
  team: string;
  opponent: string | null;
  posRank: string;
  ecr: number;
  best: number;
  worst: number;
  average: number;
  deviation: number;
  grade: string | null;
  projectedPoints: number | null;
  owned: number | null;
}

export type ListName = keyof typeof snapshot.positions;

export const SNAPSHOT = {
  season: snapshot.season,
  week: snapshot.week,
  scoring: snapshot.scoring,
  capturedAt: snapshot.capturedAt,
};

const LISTS = snapshot.positions as Record<ListName, RankedPlayer[]>;

export function list(name: ListName): RankedPlayer[] {
  return LISTS[name];
}

/**
 * Every distinct player, keyed by id.
 *
 * A player appears in several lists with different ranks. This index keeps whichever entry
 * has the most specific positional rank, which is the one to show in a roster or search
 * result.
 */
const BY_ID = new Map<string, RankedPlayer>();
for (const name of ["FLEX", "SUPERFLEX", "QB", "RB", "WR", "TE", "K", "DST", "IDP"] as ListName[]) {
  for (const player of LISTS[name]) {
    if (!BY_ID.has(player.id) || ["QB", "RB", "WR", "TE", "K", "DST"].includes(name)) {
      BY_ID.set(player.id, player);
    }
  }
}

export const ALL_PLAYERS: RankedPlayer[] = [...BY_ID.values()];

export function playerById(id: string): RankedPlayer | undefined {
  return BY_ID.get(id);
}

/**
 * The ranking list that covers every player in a comparison.
 *
 * This is not a convenience. Only experts who ranked all of the compared players can
 * express a preference between them, so the list choice determines the expert pool, and
 * mixing positions genuinely narrows it. A quarterback alongside running backs forces the
 * superflex list; kickers and defences are only ever ranked against their own position.
 */
export function listFor(players: RankedPlayer[]): ListName | null {
  const positions = new Set(players.map((p) => p.position));
  if (positions.size === 0) return null;
  if (positions.size === 1) {
    const only = [...positions][0] as ListName;
    return (["QB", "RB", "WR", "TE", "K", "DST"] as string[]).includes(only) ? only : "IDP";
  }
  if (positions.has("K") || positions.has("DST")) return null;
  if (positions.has("QB")) return "SUPERFLEX";
  return "FLEX";
}

/** The players as that list ranks them, or null if no single list covers them all. */
export function inSharedList(players: RankedPlayer[]): RankedPlayer[] | null {
  const name = listFor(players);
  if (!name) return null;
  const source = LISTS[name];
  const resolved = players.map((p) => source.find((entry) => entry.id === p.id));
  return resolved.every(Boolean) ? (resolved as RankedPlayer[]) : null;
}
