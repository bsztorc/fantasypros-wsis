/**
 * Shared column geometry for the advice view.
 *
 * The results band and the comparison tables below it have to line up, otherwise a
 * player's card sits over a different column than his own numbers.
 *
 * Both grids divide the width identically: a leading column, one column per player, then
 * a fixed strip on the right for Add Player which the tables leave empty. In the tables
 * the leading column holds the row labels. In the band it holds the recommendation
 * percentage, which needs somewhere to live that belongs to no single player, because
 * above one slot the percentage describes a set rather than an individual.
 */

/** Width of the Add Player strip at the right of the results band. */
export const ADD_PLAYER_WIDTH = 104;

/** Columns for the results band. Matches `tableColumns` exactly. */
export function bandColumns(playerCount: number): string {
  return `repeat(${playerCount + 1}, 1fr) ${ADD_PLAYER_WIDTH}px`;
}

/** Columns for a comparison table: label, one per player, then the empty strip. */
export function tableColumns(playerCount: number): string {
  return `repeat(${playerCount + 1}, 1fr) ${ADD_PLAYER_WIDTH}px`;
}
