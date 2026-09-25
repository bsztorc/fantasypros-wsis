import type { DemoState, LineupGoal, StartN } from "@/lib/types";

/** What each demo state can do. Drives every gated affordance on the page. */
export interface StateCapabilities {
  label: string;
  /** Comparison slots the user can fill. Signed out is capped at two. */
  openSlots: number;
  /** Slots rendered with a padlock instead of an empty silhouette. */
  lockedSlots: number;
  /** Whether the My Team tab shows a roster or a conversion prompt. */
  hasRoster: boolean;
  /**
   * Whether premium data is available.
   *
   * Upside Potential and Bust Risk sit behind a premium wall in the live product, and
   * league sync does not lift it. Lineup Goal reads those two meters, so the goals that
   * depend on them are premium too.
   */
  isPremium: boolean;
}

export const DEMO_STATES: Record<DemoState, StateCapabilities> = {
  "signed-out": {
    label: "Signed Out",
    openSlots: 2,
    lockedSlots: 2,
    hasRoster: false,
    isPremium: false,
  },
  "signed-in-unsynced": {
    label: "Signed In, No League Synced",
    openSlots: 4,
    lockedSlots: 0,
    hasRoster: false,
    isPremium: false,
  },
  "premium-synced": {
    label: "Premium, League Synced",
    openSlots: 4,
    lockedSlots: 0,
    hasRoster: true,
    isPremium: true,
  },
};

/** Demo states in the order they appear in the switcher. */
export const DEMO_STATE_ORDER: DemoState[] = [
  "signed-out",
  "signed-in-unsynced",
  "premium-synced",
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

/**
 * Whether a lineup goal is selectable.
 *
 * Balanced is always available, because the answer itself is never gated. Most Upside and
 * Safe Floor are weighted from the Upside Potential and Bust Risk meters, which are
 * premium, so they gate with the data they depend on.
 */
export function isLineupGoalEnabled(goal: LineupGoal, isPremium: boolean): boolean {
  return goal === "balanced" || isPremium;
}

/**
 * Which upgrade prompt a gated control should carry.
 *
 * A signed-out user cannot buy premium before they have an account, so they are asked to
 * sign up. A signed-in free user is asked to upgrade. Premium users are asked nothing.
 */
export function gateVariantFor(state: DemoState): "signup" | "premium" | undefined {
  if (state === "signed-out") return "signup";
  if (state === "signed-in-unsynced") return "premium";
  return undefined;
}
