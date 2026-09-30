import { ChevronDown, GearIcon } from "@/components/ui/icons";
import { SCORING_LABEL, WEEK_LABEL } from "@/lib/fixtures/roster";

/** Title row of the tool: week, scoring format, and settings. */
export function WsisBanner({ action }: { action?: React.ReactNode }) {
  return (
    /*
     * A row at every width. It was a column on a phone to stack the title above the scoring
     * controls, and those controls are no longer rendered there, so the row can carry the
     * title and one action side by side instead.
     */
    <div className="order-1 flex items-center justify-between gap-3 px-5 pb-4 pt-5 sm:items-start sm:gap-4">
      {/* `min-w-0` lets the title wrap beside the button; desktop keeps `auto`. */}
      <div className="min-w-0 sm:min-w-[auto]">
        {/*
          Two lines on a phone, broken where the sentence already breaks: the question, then
          which week it is being asked about. Beside the Compare button the single line wrapped
          anyway, and it wrapped mid-phrase. The dash that joined the two only reads as
          punctuation on one line, so it goes with the break rather than starting the second.
        */}
        <h1 className="text-[17px] font-bold leading-tight text-white sm:text-[22px]">
          Who Should I Start?
          <span className="hidden sm:inline"> - </span>
          <span className="block sm:inline">{WEEK_LABEL} - {SCORING_LABEL}</span>
        </h1>
        {/*
          Three lines of preamble on a phone, sitting between the title and the players it
          is describing, and pointing "below" at a search field that is now further down
          than the players are. The screen itself says this faster than the sentence does.
        */}
        <p className="mt-1 hidden text-[13px] text-fp-on-navy sm:block">
          Get instant start / sit advice powered by experts. Search or select your players below
        </p>
      </div>

      {/*
        Neither control does anything a phone reader needs here: scoring format is already
        stated in the title beside the week, and the gear opens settings that are not part
        of this decision. Both are in the way of the players on a 375px column.
      */}
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
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

      {/* The phone's Compare button. Nothing is passed at desktop widths. */}
      {action}
    </div>
  );
}
