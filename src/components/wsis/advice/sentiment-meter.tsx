/**
 * A five-segment sentiment meter.
 *
 * The Overall row is reproduced from the live product, where a low value renders red and
 * a high value green. Upside Potential and Bust Risk are premium, so they could not be
 * observed; their colour treatment here is inferred. Bust Risk is inverted on the
 * reasonable reading that a high bust risk is not a good thing.
 */
export function SentimentMeter({
  value,
  inverted = false,
}: {
  value: number;
  inverted?: boolean;
}) {
  const effective = inverted ? 6 - value : value;
  const tone =
    effective >= 4
      ? { label: "High", text: "text-[#0e9632]", fill: "bg-[#22b45a]" }
      : effective <= 2
        ? { label: "Low", text: "text-[#d43b2f]", fill: "bg-[#e05548]" }
        : { label: "Medium", text: "text-[#b3760d]", fill: "bg-[#e0a03a]" };

  return (
    <span className="flex flex-col items-center gap-1">
      <span className={`text-xs font-semibold ${inverted ? tone.text : tone.text}`}>
        {inverted ? (value >= 4 ? "High" : value <= 2 ? "Low" : "Medium") : tone.label}
      </span>
      <span className="flex gap-1">
        {[1, 2, 3, 4, 5].map((segment) => (
          <span
            key={segment}
            className={`h-1.5 w-5 rounded-full ${segment <= value ? tone.fill : "bg-slate-200"}`}
          />
        ))}
      </span>
    </span>
  );
}
