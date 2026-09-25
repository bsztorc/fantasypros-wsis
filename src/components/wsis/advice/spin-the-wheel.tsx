/** The product's existing tie-breaker prompt. Kept as-is, not wired up. */
export function SpinTheWheel() {
  return (
    <section className="rounded-lg bg-white px-5 py-4 text-center">
      <p className="text-sm text-fp-ink">
        <span className="mr-1.5">{"✳"}</span>
        Can&apos;t decide?{" "}
        <button type="button" className="cursor-pointer font-semibold text-fp-link hover:underline">
          Spin the Wheel
        </button>
      </p>
    </section>
  );
}
