import { ChevronDown, GearIcon } from "@/components/ui/icons";
import { SCORING_LABEL, WEEK_LABEL } from "@/lib/fixtures/roster";

/** Title row of the tool: week, scoring format, and settings. */
export function WsisBanner() {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
      <div>
        <h1 className="text-[22px] font-bold leading-tight text-white">
          Who Should I Start? - {WEEK_LABEL} - {SCORING_LABEL}
        </h1>
        <p className="mt-1 text-[13px] text-fp-on-navy">
          Get instant start / sit advice powered by experts. Search or select your players below
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative">
          <select
            aria-label="Scoring format"
            defaultValue="half-ppr"
            className="cursor-pointer appearance-none rounded-md border border-fp-border bg-white py-2 pl-3 pr-9 text-[13px] font-medium text-fp-ink focus:outline-none"
          >
            <option value="half-ppr">Scoring: Half-PPR</option>
            <option value="ppr">Scoring: PPR</option>
            <option value="standard">Scoring: Standard</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fp-ink" />
        </div>

        <button
          type="button"
          aria-label="Tool settings"
          className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-md bg-[#ededed] text-fp-ink transition-colors hover:bg-white"
        >
          <GearIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
