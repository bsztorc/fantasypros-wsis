/** Colour per position, tolerant of positions outside the standard set (IDP, for example). */
const POSITION_COLOR: Record<string, string> = {
  QB: "text-pos-qb",
  RB: "text-pos-rb",
  WR: "text-pos-wr",
  TE: "text-pos-te",
  K: "text-pos-k",
  DST: "text-pos-dst",
};

export function positionColor(position: string): string {
  return POSITION_COLOR[position] ?? "text-pos-dst";
}

/** The coloured position label at the start of a roster row. */
export function PositionBadge({ position }: { position: string }) {
  return <span className={`text-xs font-bold ${positionColor(position)}`}>{position}</span>;
}
