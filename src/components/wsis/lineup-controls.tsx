"use client";

import { GateCta, type GateVariant } from "@/components/ui/gate-cta";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";
import { isLineupGoalEnabled, isStartNEnabled } from "@/lib/demo-state";
import type { LineupGoal, StartN } from "@/lib/types";

interface LineupControlsProps {
  goal: LineupGoal;
  onGoalChange: (goal: LineupGoal) => void;
  startN: StartN;
  onStartNChange: (startN: StartN) => void;
  /** Players currently in the comparison, which gates the Start N options. */
  playerCount: number;
  /** Premium unlocks the goals that read the Upside and Bust meters. */
  isPremium: boolean;
  /** Which upgrade prompt to show beside a gated goal, if any. */
  gateVariant?: GateVariant;
}

/**
 * Ordered as a risk scale rather than by importance, safest on the left, so the control
 * reads as a dial the user slides rather than three unrelated options. Balanced sits in
 * the middle, which is both the default and the neutral point of the scale.
 */
const GOALS: { value: LineupGoal; label: string }[] = [
  { value: "safe-floor", label: "Safe Floor" },
  { value: "balanced", label: "Balanced" },
  { value: "most-upside", label: "Most Upside" },
];

/**
 * The two new controls this prototype adds: what the user is optimising for, and how many
 * lineup spots they are filling.
 *
 * Start N options unlock only when there are more players in the comparison than spots to
 * fill. Starting two of two is not a decision, so offering it would be noise.
 *
 * Most Upside and Safe Floor are weighted from the Upside Potential and Bust Risk meters,
 * which the live product gates behind premium. They gate with the data they depend on, and
 * carry the product's own upgrade prompt so the limit reads as a tier boundary rather than
 * a broken control. Balanced stays available to everyone, because the recommendation
 * itself is never gated.
 */
export function LineupControls({
  goal,
  onGoalChange,
  startN,
  onStartNChange,
  playerCount,
  isPremium,
  gateVariant,
}: LineupControlsProps) {
  const goalOptions: SegmentedOption<LineupGoal>[] = GOALS.map((entry) => ({
    ...entry,
    disabled: !isLineupGoalEnabled(entry.value, isPremium),
    disabledHint: "Premium: weighted from the Upside Potential and Bust Risk meters",
    locked: true,
  }));

  const startNOptions: SegmentedOption<StartN>[] = ([1, 2, 3] as StartN[]).map((n) => ({
    value: n,
    label: String(n),
    disabled: !isStartNEnabled(n, playerCount),
    disabledHint: `Add ${n + 1 - playerCount} more player${n + 1 - playerCount === 1 ? "" : "s"} to start ${n}`,
  }));

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-fp-navy px-5 pb-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[15px] font-semibold text-white">Lineup Goal</span>
        <Segmented
          label="Lineup goal"
          options={goalOptions}
          value={goal}
          onChange={onGoalChange}
        />
        {!isPremium && gateVariant && <GateCta variant={gateVariant} />}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[15px] font-semibold text-white">Players to Start</span>
        <Segmented
          label="Players to start"
          size="digit"
          options={startNOptions}
          value={startN}
          onChange={onStartNChange}
        />
      </div>
    </div>
  );
}
