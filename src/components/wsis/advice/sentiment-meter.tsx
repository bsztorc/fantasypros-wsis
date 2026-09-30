/**
 * A five-segment sentiment meter, reproduced from the unlocked premium view.
 *
 * The scale has five named levels and the color follows whether the level is good for
 * the player, not whether the number is high. Bust Risk therefore runs the other way: a
 * high bust risk is red and a very low one is green. Moderate is gray on every row.
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
    /*
     * The meter compresses rather than spilling out of its column.
     *
     * The five segments were a fixed 24px each, so the meter had a hard floor of 136px
     * before padding, whatever width the column it sat in had. A comparison table divides
     * its width by the number of players, and at four players that column is under 136px
     * on any viewport below about 720px: the meter then overflowed its own cell and was
     * cut off by the panel, which clips rather than scrolls, so the rightmost sentiment
     * values were simply not on screen.
     *
     * The segments now share the width they are given, capped at the 24px they used to be
     * fixed at. Wherever the column is 136px or wider the meter is the same object it was,
     * segment for segment; narrower than that it scales down instead of disappearing.
     */
    <span className="flex w-full min-w-0 flex-col items-center gap-1.5">
      <span className={`text-[13px] font-semibold ${tone.text}`}>{LEVEL_LABELS[value]}</span>
      <span className="flex w-full max-w-[136px] gap-1">
        {[1, 2, 3, 4, 5].map((segment) => (
          <span
            key={segment}
            className={`h-[3px] min-w-0 max-w-6 flex-1 rounded-full ${segment <= value ? tone.fill : "bg-slate-200"}`}
          />
        ))}
      </span>
    </span>
  );
}
