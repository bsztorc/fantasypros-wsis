/** A labelled row of per-player values, used by the Matchup, Fantasy Points and Misc modules. */
export interface CompareRow {
  label: string;
  values: React.ReactNode[];
}

function Row({ label, values }: CompareRow) {
  if (values.length === 2) {
    return (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-fp-border px-5 py-2.5 last:border-b-0">
        <span className="text-sm font-semibold text-fp-ink">{values[0]}</span>
        <span className="text-center text-xs text-fp-muted">{label}</span>
        <span className="text-right text-sm font-semibold text-fp-ink">{values[1]}</span>
      </div>
    );
  }

  return (
    <div
      className="grid items-center gap-3 border-b border-fp-border px-5 py-2.5 last:border-b-0"
      style={{ gridTemplateColumns: `140px repeat(${values.length}, minmax(0, 1fr))` }}
    >
      <span className="text-xs text-fp-muted">{label}</span>
      {values.map((value, index) => (
        <span key={index} className="text-sm font-semibold text-fp-ink">
          {value}
        </span>
      ))}
    </div>
  );
}

export function CompareModule({ title, rows }: { title: string; rows: CompareRow[] }) {
  return (
    <section className="overflow-hidden rounded-lg bg-white">
      <h3 className="border-b border-fp-border px-5 py-3 text-[15px] font-bold text-fp-ink">
        {title}
      </h3>
      {rows.map((row) => (
        <Row key={row.label} {...row} />
      ))}
    </section>
  );
}

/** Five-star matchup rating. */
export function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5`} className="text-sm tracking-tight">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? "text-fp-gold" : "text-slate-300"}>
          {"★"}
        </span>
      ))}
    </span>
  );
}
