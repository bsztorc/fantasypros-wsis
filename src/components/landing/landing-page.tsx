import Image from "next/image";
import Link from "next/link";

/** Where every call to action on this page sends the reader. */
const TOOL_HREF = "/wsis";

/**
 * Type scale, read off FantasyPros' own article pages rather than chosen.
 *
 * Their article body is Poppins 18/32 at #16191d, and a section heading inside an article
 * is the same size in bold rather than a larger size. The column is 900px wide with 2rem
 * of padding, which is `.product-pillar` on their site and what `max-w-[900px] px-5` gives
 * here. Copy and screenshots both run the full 860px so nothing sits short of anything else.
 */
/** The intro paragraph only. 20px rather than 22px so its longest line clears 860px. */
const LEAD = "text-[20px] font-bold leading-[34px] text-fp-ink";
/** Section headings, and the closing line above the button, which is one of them in kind. */
const HEADING = "text-[18px] font-bold leading-[32px] text-fp-ink";
const COPY = "mt-[18px] flex flex-col gap-[18px] text-[18px] leading-[32px] text-fp-ink";
const SECTION = "border-t border-fp-border py-10";

/**
 * A screenshot of the real tool, captured from the frozen Week 3 snapshot.
 *
 * These are captures of a wide desktop UI. Squeezed into a phone's width the player names
 * and the percentage stop being readable, which defeats the point of showing them, so below
 * roughly 760px the shot keeps its size and scrolls sideways inside its own box instead.
 */
function Shot({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <div className="-mx-5 mt-8 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 940px) 760px, 860px"
        className="h-auto w-full min-w-[760px] rounded-lg"
      />
    </div>
  );
}

/**
 * The hero, built the way FantasyPros builds theirs.
 *
 * On their product pillars the whole banner is one link and the call to action inside it is
 * live text that underlines on hover. The artwork carries the wordmark and the arrow, so
 * only "Try it now" is rendered here, positioned against the arrow in percentages and sized
 * in `cqw` so it tracks the image at every width instead of drifting off the arrow.
 */
function Hero() {
  return (
    <Link href={TOOL_HREF} className="group @container relative mt-8 block">
      <Image
        src="/wsis-hero.png"
        alt="Who Should I Start? The question changes every week. Now the answer can too."
        width={847}
        height={303}
        priority
        sizes="(max-width: 940px) 100vw, 860px"
        className="h-auto w-full rounded-lg"
      />
      <span
        className="absolute right-[84.3%] top-[75.2%] -translate-y-1/2 whitespace-nowrap text-[1.63cqw] font-semibold leading-none text-fp-ink group-hover:underline"
      >
        Try it now
      </span>
    </Link>
  );
}

/**
 * The landing page, and the site's root.
 *
 * It sits at `/` because the deliverable is a single shared link: whoever opens it should
 * meet the feature before the tool. The tool is one click away from the banner, which is
 * why that call to action sits above the fold rather than only at the end of the page.
 */
export function LandingPage() {
  return (
    <>
      <header className="border-b border-fp-border bg-white">
        <div className="mx-auto flex h-16 max-w-[900px] items-center px-5">
          {/* Not a link: this page is already home, and the tool has its own call to action. */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fp-navy">
            <Image src="/fp-icon.svg" alt="FantasyPros" width={40} height={40} priority />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] px-5 pb-16">
        <Hero />

        {/*
         * Three parallel beats, so they are broken onto three lines to make the repetition
         * visible rather than letting the measure decide. Only once the column is at its
         * full 860px, because the longest of the three runs 782px and would otherwise wrap
         * into a fourth ragged line, which is worse than not breaking at all.
         */}
        <p className={`mb-10 mt-8 ${LEAD}`}>
          <span className="min-[900px]:block">
            Some weeks you’re not picking one player, you’re picking two.{" "}
          </span>
          <span className="min-[900px]:block">
            Some weeks you need a floor, not a ceiling.{" "}
          </span>
          <span className="min-[900px]:block">
            Tell Who Should I Start? what you need and it recommends the combination.
          </span>
        </p>

        <section className={SECTION}>
          <h2 className={HEADING}>Start the right number</h2>
          <div className={COPY}>
            <p>
              You have two roster spots open and three players who could fill them. Which one do
              you sit?
            </p>
            <p>
              Set <strong className="font-bold">Players to Start</strong> to the number of spots
              you need to fill. Who Should I Start? counts how often the experts would start each
              player in your situation and recommends the combination, not just the top player.
            </p>
          </div>
          <Shot
            src="/wsis-pick-two.png"
            alt="Who Should I Start? filling two spots from three players, with the recommended pair sharing one tile under a single percentage."
            width={1136}
            height={280}
          />
        </section>

        <section className={SECTION}>
          <h2 className={HEADING}>Tune it for what you need</h2>
          <div className={COPY}>
            <p>
              You’re down 21 points after Thursday. You need to swing for a ceiling play to catch
              up. Next week you’re up 18 and looking for the safest floor option to protect the
              lead.
            </p>
            <p>
              Set your <strong className="font-bold">Lineup Goal</strong> to Safe Floor, Balanced,
              or Most Upside and the recommendation moves with it. Same players, same spots, a
              different answer for a different goal.
            </p>
          </div>
          <Shot
            src="/wsis-most-upside.png"
            alt="The same two spots with the lineup goal set to Most Upside, showing a different recommended pair."
            width={1108}
            height={274}
          />
        </section>

        <section className={SECTION}>
          <h2 className={HEADING}>Built on the rankings you already trust</h2>
          <div className={COPY}>
            <p>
              No re-ranking. It’s the same Expert Consensus Rankings behind every Who Should I
              Start? answer. Now with the ability to ask more than one type of question.
            </p>
          </div>
        </section>

        <section className="border-t border-fp-border pt-10">
          <p className={HEADING}>Set the number. Set the goal.</p>
          <Link
            href={TOOL_HREF}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-fp-blue px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-fp-blue-bright"
          >
            Get your lineup now
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    </>
  );
}
