"use client";

import type { TeamTab } from "@/lib/types";

const TABS: { value: TeamTab; label: string }[] = [
  { value: "my-team", label: "My Team" },
  { value: "top-players", label: "Top Players" },
];

/** My Team / Top Players switcher below the comparison slots. */
export function TeamTabs({
  active,
  onChange,
}: {
  active: TeamTab;
  onChange: (tab: TeamTab) => void;
}) {
  return (
    <div className="flex gap-6 bg-fp-navy-tab px-5 pt-3">
      {TABS.map((tab) => {
        const selected = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            aria-current={selected ? "page" : undefined}
            onClick={() => onChange(tab.value)}
            className={[
              "cursor-pointer border-b-[3px] pb-2 text-[15px] transition-colors",
              selected
                ? "border-fp-underline font-semibold text-white"
                : "border-transparent font-normal text-fp-on-navy hover:text-white",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
