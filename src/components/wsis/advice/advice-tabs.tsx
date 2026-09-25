"use client";

/**
 * Tabs for the advice view, consolidated from the eleven the product shows today.
 *
 * Points, Targets and Rushes fold into Game Log, which also corrects a real defect: the
 * current Game Log tab shows a schedule rather than game-by-game results. News, Notes and
 * Articles are removed; Notes renders empty today and the other two duplicate content
 * that already has a home.
 */
export const ADVICE_TABS = ["Overview", "Stats", "Projections", "Odds", "Game Log"] as const;

export type AdviceTab = (typeof ADVICE_TABS)[number];

export function AdviceTabs({
  active,
  onChange,
}: {
  active: AdviceTab;
  onChange: (tab: AdviceTab) => void;
}) {
  return (
    <div className="flex gap-6 overflow-x-auto bg-fp-navy-tab px-5 pt-3">
      {ADVICE_TABS.map((tab) => {
        const selected = tab === active;
        return (
          <button
            key={tab}
            type="button"
            aria-current={selected ? "page" : undefined}
            onClick={() => onChange(tab)}
            className={[
              "shrink-0 cursor-pointer border-b-[3px] pb-2 text-sm transition-colors",
              selected
                ? "border-fp-underline font-bold text-white"
                : "border-transparent font-normal text-fp-on-navy hover:text-white",
            ].join(" ")}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
