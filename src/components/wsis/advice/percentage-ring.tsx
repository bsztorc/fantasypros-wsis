/**
 * The circular vote-share indicator.
 *
 * The ring shows the share of experts whose *first choice* is this player, which is not
 * the same as a ranking. Percentages are rounded per player, so three or four of them do
 * not always total exactly 100, matching the real product.
 */
export function PercentageRing({
  share,
  leading,
  size = 104,
}: {
  share: number;
  leading: boolean;
  size?: number;
}) {
  const stroke = Math.max(6, Math.round(size * 0.085));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(Math.max(share, 0), 100) / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="rgba(255,255,255,0.16)" stroke="#ffffff" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={leading ? "#22b45a" : "#b9bec6"}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference - filled}`}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-bold text-white"
        style={{ fontSize: Math.round(size * 0.24) }}
      >
        {share}%
      </span>
    </div>
  );
}

/** The small flat percentage badge used for non-leading players in a 3+ comparison. */
export function PercentageBadge({ share }: { share: number }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4a6187] text-xs font-semibold text-white">
      {share}%
    </span>
  );
}
