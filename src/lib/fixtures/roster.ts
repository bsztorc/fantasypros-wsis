import type { Player } from "@/lib/types";

/**
 * The synced user's roster, transcribed from the concept design.
 *
 * Fixture data. Ranks, opponents and team assignments are illustrative and are not
 * pulled from a live feed.
 */
export const MY_ROSTER: Player[] = [
  { id: "burrow", name: "J. Burrow", position: "QB", team: "CIN", opponent: "at PIT", rank: "QB9" },
  { id: "gibbs", name: "J. Gibbs", position: "RB", team: "DET", opponent: "vs. NYJ", rank: "RB1" },
  { id: "barkley", name: "S. Barkley", position: "RB", team: "PHI", opponent: "at CHI", rank: "RB10" },
  { id: "love-j", name: "J. Love", position: "RB", team: "ARI", opponent: "at SF", rank: "RB25" },
  { id: "kamara", name: "A. Kamara", position: "RB", team: "NO", opponent: "vs. LV", rank: "RB54" },
  { id: "london", name: "D. London", position: "WR", team: "ATL", opponent: "at GB", rank: "WR13" },
  { id: "mitchell-a", name: "A. Mitchell", position: "WR", team: "NYJ", opponent: "at DET", rank: "WR29" },
  { id: "vele", name: "D. Vele", position: "WR", team: "NO", opponent: "vs. LV", rank: "WR32" },
  { id: "godwin", name: "C. Godwin Jr.", position: "WR", team: "TB", opponent: "vs. MIN", rank: "WR39" },
  { id: "concepcion", name: "KC Concepcion Jr.", position: "WR", team: "CLE", opponent: "vs. CAR", rank: "WR45" },
  { id: "tucker-t", name: "T. Tucker", position: "WR", team: "LV", opponent: "at NO", rank: "WR46" },
  { id: "thomas-b", name: "B. Thomas Jr.", position: "WR", team: "JAC", opponent: "vs. NE", rank: "WR47" },
  { id: "pittman", name: "M. Pittman Jr.", position: "WR", team: "PIT", opponent: "vs. CIN", rank: "WR111" },
  { id: "warren-t", name: "T. Warren", position: "TE", team: "IND", opponent: "vs. HOU", rank: "TE9" },
  { id: "sea-dst", name: "SEA DST", position: "DST", team: "SEA", opponent: "at WAS", rank: "DST1" },
  { id: "mclaughlin", name: "C. McLaughlin", position: "K", team: "TB", opponent: "vs. MIN", rank: "K14" },
];

/** The synced user's league, shown in the roster picker. */
export const MY_LEAGUE = "The Quest for the Tyler";

/** Scoring format and week, shown in the banner. */
export const WEEK_LABEL = "Week 3";
export const SCORING_LABEL = "HALF";
