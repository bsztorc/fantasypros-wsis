"use client";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  /** Rendered dimmed and non-interactive. */
  disabled?: boolean;
  /** Announced to screen readers in place of the label when disabled. */
  disabledHint?: string;
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
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={selected}
            disabled={option.disabled}
            title={option.disabled ? option.disabledHint : undefined}
            onClick={() => onChange(option.value)}
            className={[
              size === "text" ? "px-6" : "px-8",
              "py-2.5 text-sm font-semibold transition-colors",
              index > 0 ? "border-l border-fp-navy-divider" : "",
              selected
                ? "bg-fp-blue-bright text-white"
                : option.disabled
                  ? "bg-fp-navy-deep text-white/30 cursor-not-allowed"
                  : "bg-fp-navy-deep text-white hover:bg-fp-navy-slot cursor-pointer",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
