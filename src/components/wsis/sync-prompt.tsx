"use client";

import { SyncIcon } from "@/components/ui/icons";
import type { DemoState } from "@/lib/types";

/**
 * The My Team empty state for users without a synced roster.
 *
 * The copy differs by state because the ask differs: a signed-out user has to create an
 * account before they can sync anything.
 */
export function SyncPrompt({ demoState }: { demoState: DemoState }) {
  const signedOut = demoState === "signed-out";

  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-lg bg-white px-6 py-12 text-center">
      <SyncIcon className="h-8 w-8 text-slate-400" />
      <p className="max-w-[420px] text-[17px] font-semibold leading-snug text-fp-ink">
        {signedOut
          ? "You don't have any synced leagues. Create a free account to sync and compare players on your teams."
          : "You don't have any synced leagues. Sync now to view and compare players on your teams."}
      </p>
      <button
        type="button"
        className="cursor-pointer rounded-md bg-fp-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fp-blue-bright"
      >
        {signedOut ? "Create an account" : "Sync your league"}
      </button>
    </div>
  );
}
