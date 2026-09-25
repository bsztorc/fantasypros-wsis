import type { Player } from "@/lib/types";

/**
 * The FLEX "Top Players" list, transcribed from the current product.
 *
 * Fixture data. The live tool ranks these from expert consensus; here the order is fixed
 * so the prototype renders identically on every load.
 */
export const TOP_PLAYERS: Player[] = [
  { id: "tp-gibbs", name: "J. Gibbs", position: "RB", team: "DET", opponent: "vs. NYJ", rank: "RB1" },
  { id: "tp-walker", name: "K. Walker III", position: "RB", team: "KC", opponent: "vs. BAL", rank: "RB2" },
  { id: "tp-robinson", name: "B. Robinson", position: "RB", team: "ATL", opponent: "at GB", rank: "RB3" },
  { id: "tp-jsn", name: "J. Smith-Njigba", position: "WR", team: "SEA", opponent: "at WAS", rank: "WR1" },
  { id: "tp-cmc", name: "C. McCaffrey", position: "RB", team: "SF", opponent: "vs. ARI", rank: "RB4" },
  { id: "tp-henry", name: "D. Henry", position: "RB", team: "BAL", opponent: "at KC", rank: "RB5" },
  { id: "tp-stbrown", name: "A. St. Brown", position: "WR", team: "DET", opponent: "vs. NYJ", rank: "WR2" },
  { id: "tp-taylor", name: "J. Taylor", position: "RB", team: "IND", opponent: "vs. HOU", rank: "RB6" },
  { id: "tp-jeanty", name: "A. Jeanty", position: "RB", team: "LV", opponent: "at NO", rank: "RB7" },
  { id: "tp-cook", name: "J. Cook III", position: "RB", team: "BUF", opponent: "vs. MIA", rank: "RB8" },
  { id: "tp-chase", name: "J. Chase", position: "WR", team: "CIN", opponent: "vs. PIT", rank: "WR3" },
  { id: "tp-brown-c", name: "C. Brown", position: "RB", team: "CIN", opponent: "vs. PIT", rank: "RB9" },
  { id: "tp-lamb", name: "C. Lamb", position: "WR", team: "DAL", opponent: "at NYG", rank: "WR4" },
  { id: "tp-jefferson", name: "J. Jefferson", position: "WR", team: "MIN", opponent: "at TB", rank: "WR5" },
  { id: "tp-olave", name: "C. Olave", position: "WR", team: "NO", opponent: "vs. LV", rank: "WR6" },
  { id: "tp-barkley", name: "S. Barkley", position: "RB", team: "PHI", opponent: "at CHI", rank: "RB10" },
  { id: "tp-hall", name: "B. Hall", position: "RB", team: "NYJ", opponent: "at DET", rank: "RB11" },
  { id: "tp-achane", name: "D. Achane", position: "RB", team: "MIA", opponent: "at BUF", rank: "RB12" },
  { id: "tp-smith-d", name: "D. Smith", position: "WR", team: "PHI", opponent: "at CHI", rank: "WR7" },
  { id: "tp-williams-j", name: "J. Williams", position: "RB", team: "DAL", opponent: "at NYG", rank: "RB13" },
  { id: "tp-watson", name: "C. Watson", position: "WR", team: "GB", opponent: "vs. ATL", rank: "WR8" },
  { id: "tp-wilson-g", name: "G. Wilson", position: "WR", team: "NYJ", opponent: "at DET", rank: "WR9" },
  { id: "tp-hampton", name: "O. Hampton", position: "RB", team: "LAC", opponent: "vs. DEN", rank: "RB14" },
  { id: "tp-mcbride", name: "T. McBride", position: "TE", team: "ARI", opponent: "at SF", rank: "TE1" },
  { id: "tp-washington", name: "P. Washington", position: "WR", team: "JAC", opponent: "vs. NE", rank: "WR10" },
  { id: "tp-hubbard", name: "C. Hubbard", position: "RB", team: "CAR", opponent: "at CLE", rank: "RB15" },
  { id: "tp-williams-k", name: "K. Williams", position: "RB", team: "LAR", opponent: "vs. IND", rank: "RB16" },
  { id: "tp-pickens", name: "G. Pickens", position: "WR", team: "DAL", opponent: "at NYG", rank: "WR11" },
  { id: "tp-adams", name: "D. Adams", position: "WR", team: "LAR", opponent: "vs. IND", rank: "WR12" },
  { id: "tp-london", name: "D. London", position: "WR", team: "ATL", opponent: "at GB", rank: "WR13" },
];

/** Position filter tabs above the Top Players grid. */
export const POSITION_FILTERS = ["QB", "RB", "WR", "TE", "FLEX", "Superflex", "K", "DST", "IDP"] as const;
