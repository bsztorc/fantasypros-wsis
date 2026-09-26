import { LockIcon } from "@/components/ui/icons";
import { tableColumns } from "@/lib/layout";

/** A labeled row of per-player values, used by every comparison module. */
export interface CompareRow {
  label: string;
  values: React.ReactNode[];
  /**
   * Index of the value that favours its player, highlighted green.
   *
   * The product marks the best value in a row rather than leaving the reader to scan, so
   * rows where one value is plainly better carry it.
   */
  bestIndex?: number;
}

function Row({ label, values, bestIndex }: CompareRow) {
  if (values.length === 2) {
    return (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-fp-border px-5 py-2.5 last:border-b-0 odd:bg-[#fafbfc]">
        <span
          className={`flex justify-center text-sm font-semibold ${bestIndex === 0 ? "text-[#0f9d63]" : "text-fp-ink"}`}
        >
          {values[0]}
        </span>
        <span className="min-w-[140px] text-center text-xs text-fp-muted">{label}</span>
        <span
          className={`flex justify-center text-sm font-semibold ${bestIndex === 1 ? "text-[#0f9d63]" : "text-fp-ink"}`}
        >
          {values[1]}
        </span>
      </div>
    );
  }

  return (
    <div
      className="grid items-center border-b border-fp-border py-2.5 last:border-b-0 odd:bg-[#fafbfc]"
      style={{ gridTemplateColumns: tableColumns(values.length) }}
    >
      <span className="px-3 text-right text-xs text-fp-muted">{label}</span>
      {values.map((value, index) => (
        <span
          key={index}
          className={`flex justify-center px-3 text-sm font-semibold ${index === bestIndex ? "text-[#0f9d63]" : "text-fp-ink"}`}
        >
          {value}
        </span>
      ))}
    </div>
  );
}

/**
 * The player name row that heads the comparison modules.
 *
 * Only rendered from three players up. With two, each card already sits directly above
 * its own half and the names would be redundant.
 */
function PlayerHeaderRow({ names }: { names: string[] }) {
  if (names.length < 3) return null;

  return (
    <div
      className="grid items-center border-b border-fp-border bg-white py-3"
      style={{ gridTemplateColumns: tableColumns(names.length) }}
    >
      <span />
      {names.map((name) => (
        <span key={name} className="px-3 text-center text-[15px] font-bold text-fp-ink">
          {name}
        </span>
      ))}
    </div>
  );
}

export function CompareModule({
  title,
  rows,
  playerNames,
  footer,
}: {
  title: string;
  rows: CompareRow[];
  /** Renders the player name header above the title, for the first module on the page. */
  playerNames?: string[];
  footer?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg bg-white">
      {playerNames && <PlayerHeaderRow names={playerNames} />}
      <h3 className="px-5 py-3 text-center text-[15px] font-bold text-fp-ink">{title}</h3>
      {rows.map((row) => (
        <Row key={row.label} {...row} />
      ))}
      {footer}
    </section>
  );
}

/** A value the current tier cannot see. */
export function LockedValue() {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-14 rounded-full bg-slate-200" />
      <LockIcon className="h-3.5 w-3.5 text-slate-400" />
    </span>
  );
}

/** The upgrade prompt the product puts at the foot of a partially gated module. */
export function PremiumFooter() {
  return (
    <div className="flex items-center justify-center gap-2 border-t border-fp-border bg-[#fffdf5] px-5 py-2.5">
      <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-fp-gold text-[10px] font-bold text-white">
        P
      </span>
      <button type="button" className="cursor-pointer text-sm font-semibold text-fp-ink hover:underline">
        Upgrade to Premium
      </button>
    </div>
  );
}

/** Index of the largest number in a list, for rows where higher is better. */
export function indexOfMax(values: number[]): number {
  return values.reduce((best, value, index) => (value > values[best] ? index : best), 0);
}

/** Five-star matchup rating. */
export function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5`} className="text-sm tracking-tight">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? "text-fp-blue" : "text-slate-300"}>
          {"★"}
        </span>
      ))}
    </span>
  );
}
