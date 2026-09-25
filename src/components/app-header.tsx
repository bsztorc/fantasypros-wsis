"use client";

import Image from "next/image";
import { ChevronDown } from "@/components/ui/icons";
import { DEMO_STATES, DEMO_STATE_ORDER } from "@/lib/demo-state";
import type { DemoState } from "@/lib/types";

interface AppHeaderProps {
  demoState: DemoState;
  onDemoStateChange: (state: DemoState) => void;
}

/**
 * Page chrome: the FantasyPros mark, and the demo state switcher.
 *
 * The switcher is a prototype affordance for walking through the three access states in
 * one session. It is not a proposed product feature, which is why it sits in the page
 * chrome rather than inside the tool.
 */
export function AppHeader({ demoState, onDemoStateChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-fp-border bg-white">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fp-navy">
          <Image src="/fp-icon.svg" alt="FantasyPros" width={40} height={40} priority />
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="demo-state" className="text-sm font-semibold text-fp-ink">
            Demo Mode
          </label>
          <div className="relative">
            <select
              id="demo-state"
              value={demoState}
              onChange={(event) => onDemoStateChange(event.target.value as DemoState)}
              className="w-[268px] cursor-pointer appearance-none rounded-md border border-fp-border bg-white py-2.5 pl-3 pr-9 text-sm text-fp-ink shadow-sm focus:border-fp-blue focus:outline-none"
            >
              {DEMO_STATE_ORDER.map((state) => (
                <option key={state} value={state}>
                  {DEMO_STATES[state].label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fp-ink" />
          </div>
        </div>
      </div>
    </header>
  );
}
