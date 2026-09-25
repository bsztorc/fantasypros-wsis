import type { DemoState, StartN } from "@/lib/types";

/** What each demo state can do. Drives every gated affordance on the page. */
export interface StateCapabilities {
  label: string;
  /** Comparison slots the user can fill. Signed out is capped at two. */
  openSlots: number;
  /** Slots rendered with a padlock instead of an empty silhouette. */
  lockedSlots: number;
  /** Whether the My Team tab shows a roster or a conversion prompt. */
  hasRoster: boolean;
}

export const DEMO_STATES: Record<DemoState, StateCapabilities> = {
  "signed-out": {
    label: "Signed Out",
    openSlots: 2,
    lockedSlots: 2,
    hasRoster: false,
  },
  "signed-in-unsynced": {
    label: "Signed In, No League Synced",
    openSlots: 4,
    lockedSlots: 0,
    hasRoster: false,
  },
  "signed-in-synced": {
    label: "Signed In, League Synced",
    openSlots: 4,
    lockedSlots: 0,
    hasRoster: true,
  },
};

/** Demo states in the order they appear in the switcher. */
export const DEMO_STATE_ORDER: DemoState[] = [
  "signed-out",
  "signed-in-unsynced",
  "signed-in-synced",
];

/**
 * Whether a given Start N option is selectable.
 *
 * Starting N of N is not a decision, so an option only unlocks once the user has added
 * more players than spots they are filling. N=1 is always available.
 */
export function isStartNEnabled(n: StartN, playerCount: number): boolean {
  return n === 1 || playerCount > n;
}

/** The highest Start N currently selectable for a given number of players. */
export function maxEnabledStartN(playerCount: number): StartN {
  if (playerCount > 3) return 3;
  if (playerCount > 2) return 2;
  return 1;
}
