import type { Position } from "@/lib/types";

const POSITION_COLOR: Record<Position, string> = {
  QB: "text-pos-qb",
  RB: "text-pos-rb",
  WR: "text-pos-wr",
  TE: "text-pos-te",
  K: "text-pos-k",
  DST: "text-pos-dst",
};

/** The coloured position label at the start of a roster row. */
export function PositionBadge({ position }: { position: Position }) {
  return (
    <span className={`text-xs font-bold ${POSITION_COLOR[position]}`}>{position}</span>
  );
}
