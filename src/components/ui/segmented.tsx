"use client";

import { LockIcon } from "@/components/ui/icons";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  /** Rendered dimmed and non-interactive. */
  disabled?: boolean;
  /** Announced to screen readers in place of the label when disabled. */
  disabledHint?: string;
  /**
   * Show a padlock when disabled.
   *
   * Only for options withheld by tier. An option that is merely unavailable right now,
   * such as Start N before enough players are added, is not locked and should not claim
   * to be.
   */
  locked?: boolean;
}

interface SegmentedProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  /** Wider padding for text labels, narrower for single digits. */
  size?: "text" | "digit";
}

/**
 * The navy segmented control used for Lineup Goal and Players to Start.
 *
 * Disabled segments stay visible rather than disappearing: the point of the prototype is
 * that the user can see what is unavailable and why.
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  size = "text",
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex overflow-hidden rounded-md border border-fp-navy-divider"
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        const showLock = option.disabled && option.locked;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={selected}
            disabled={option.disabled}
            title={option.disabled ? option.disabledHint : undefined}
            onClick={() => onChange(option.value)}
            className={[
              size === "text" ? "px-5" : "px-8",
              "flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition-colors",
              index > 0 ? "border-l border-fp-navy-divider" : "",
              selected
                ? "bg-fp-blue-bright text-white"
                : option.disabled
                  ? "bg-fp-navy-deep text-white/30 cursor-not-allowed"
                  : "bg-fp-navy-deep text-white hover:bg-fp-navy-slot cursor-pointer",
            ].join(" ")}
          >
            {showLock && <LockIcon className="h-3 w-3" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
