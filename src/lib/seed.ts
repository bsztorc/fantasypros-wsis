/**
 * Stable pseudo-random number in [0, 1) derived from a string and a salt.
 *
 * The prototype has no backend, but it must not shuffle its numbers on every render or a
 * walkthrough becomes impossible to follow. Same id and salt, same value, always.
 */
export function seeded(id: string, salt: number): number {
  let hash = salt;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return (hash % 1000) / 1000;
}
