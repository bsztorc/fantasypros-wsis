/**
 * The product's two upgrade prompts, reused wherever a control is gated.
 *
 * Rendered as inline text rather than a button. A button on a row of controls reads as
 * another action the user can take; this is an explanation of why the neighbouring
 * options are locked, so it is styled like the tool's other inline prompts.
 *
 * Which prompt appears depends on what the user actually needs to do next: a signed-out
 * user has to create an account before premium is even a question, so they are never
 * shown an upgrade prompt.
 */
export type GateVariant = "signup" | "premium";

export function GateCta({ variant }: { variant: GateVariant }) {
  if (variant === "signup") {
    return (
      <button
        type="button"
        className="flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-[#79bbff] hover:underline"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="10" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5.5 15.5a5 5 0 0 1 9 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Sign Up To Unlock
      </button>
    );
  }

  return (
    <button
      type="button"
      className="flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-white hover:underline"
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-fp-gold text-[10px] font-bold text-white">
        P
      </span>
      Upgrade to Premium
    </button>
  );
}
