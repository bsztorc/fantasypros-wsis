/**
 * A five-segment sentiment meter, reproduced from the unlocked premium view.
 *
 * The scale has five named levels and the colour follows whether the level is good for
 * the player, not whether the number is high. Bust Risk therefore runs the other way: a
 * high bust risk is red and a very low one is green. Moderate is grey on every row.
 */
export type SentimentLevel = 1 | 2 | 3 | 4 | 5;

const LEVEL_LABELS: Record<SentimentLevel, string> = {
  1: "Very Low",
  2: "Low",
  3: "Moderate",
  4: "High",
  5: "Very High",
};

const TONE = {
  good: { text: "text-[#2abb7f]", fill: "bg-[#2abb7f]" },
  bad: { text: "text-[#e2483d]", fill: "bg-[#e2483d]" },
  neutral: { text: "text-[#868b95]", fill: "bg-[#868b95]" },
};

export function SentimentMeter({
  value,
  /** True when a high value is bad for the player, as with Bust Risk. */
  inverted = false,
}: {
  value: SentimentLevel;
  inverted?: boolean;
}) {
  const favourable = inverted ? 6 - value : value;
  const tone = favourable >= 4 ? TONE.good : favourable <= 2 ? TONE.bad : TONE.neutral;

  return (
    <span className="flex flex-col items-center gap-1.5">
      <span className={`text-[13px] font-semibold ${tone.text}`}>{LEVEL_LABELS[value]}</span>
      <span className="flex gap-1">
        {[1, 2, 3, 4, 5].map((segment) => (
          <span
            key={segment}
            className={`h-[3px] w-6 rounded-full ${segment <= value ? tone.fill : "bg-slate-200"}`}
          />
        ))}
      </span>
    </span>
  );
}
