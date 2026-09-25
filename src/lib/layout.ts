/**
 * Shared column geometry for the advice view.
 *
 * The results band and the comparison tables below it have to line up, otherwise a
 * player's card sits over a different column than his own numbers. Measured from the
 * product: the leading player's card spans two column units and every other player's
 * spans one, so the leader's card ends exactly where his data column does.
 *
 * Both grids reserve the same fixed strip on the right for Add Player, and both divide
 * the remaining space into the same number of fractional units. The tables leave that
 * strip empty, since nothing sits beneath it.
 */

/** Width of the Add Player strip at the right of the results band. */
export const ADD_PLAYER_WIDTH = 104;

/**
 * Columns for the results band: a double-width leader, single-width runners, then the
 * fixed Add Player strip. Totals `playerCount + 1` fractional units.
 */
export function bandColumns(playerCount: number): string {
  return `2fr repeat(${playerCount - 1}, 1fr) ${ADD_PLAYER_WIDTH}px`;
}

/**
 * Columns for a comparison table: a label column, one per player, then an empty strip
 * matching Add Player. Also totals `playerCount + 1` fractional units, which is what
 * makes the two grids share boundaries.
 */
export function tableColumns(playerCount: number): string {
  return `repeat(${playerCount + 1}, 1fr) ${ADD_PLAYER_WIDTH}px`;
}
