import { LockIcon } from "@/components/ui/icons";

/**
 * A module the current product gates behind an account.
 *
 * The prototype keeps these gated rather than unlocking them, because the gating
 * principle it argues for is the opposite: gate the personalisation, never the answer.
 * Showing the existing gates makes that contrast visible.
 */
export function LockedModule({
  title,
  children,
  ctaLabel = "Sign Up To Unlock",
}: {
  title: string;
  children: React.ReactNode;
  ctaLabel?: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg bg-white">
      <h3 className="border-b border-fp-border px-5 py-3 text-[15px] font-bold text-fp-ink">
        {title}
      </h3>
      <div className="relative">
        <div className="pointer-events-none select-none px-5 py-5 opacity-30 blur-[2px]" aria-hidden>
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/45">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-md bg-fp-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fp-blue-bright"
          >
            <LockIcon className="h-4 w-4" />
            {ctaLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
