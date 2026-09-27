import Image from "next/image";
import Link from "next/link";

/** Where every call to action on this page sends the reader. */
const TOOL_HREF = "/wsis";

/**
 * Page chrome for the landing page.
 *
 * Deliberately not the tool's AppHeader: that one carries the demo state switcher, which
 * is a prototype affordance and has nothing to say to someone reading about the feature.
 */
function LandingHeader() {
  return (
    <header className="border-b border-fp-border bg-white">
      <div className="mx-auto flex h-16 max-w-[900px] items-center px-5">
        {/* Not a link: this page is already home, and the tool has its own call to action. */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fp-navy">
          <Image src="/fp-icon.svg" alt="FantasyPros" width={40} height={40} priority />
        </div>
      </div>
    </header>
  );
}

/**
 * A screenshot of the real tool, captured from the frozen Week 3 snapshot.
 *
 * Captions name the setting rather than the players. The copy on this page never mentions
 * a player by name, so it does not date itself to one week's rankings, and a caption that
 * named names would undo that.
 */
function Shot({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}) {
  return (
    <figure className="mt-8">
      {/*
       * These are captures of a wide desktop UI. Squeezed into a phone's width the player
       * names and the percentage stop being readable, which defeats the point of showing
       * them, so below roughly 760px the shot keeps its size and scrolls sideways instead.
       */}
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 940px) 760px, 900px"
          className="h-auto w-full min-w-[760px] rounded-lg"
        />
      </div>
      <figcaption className="mt-3 text-[14px] text-fp-muted">{caption}</figcaption>
    </figure>
  );
}

/** Body copy sits on a narrower measure than the screenshots, which run the full column. */
const COPY = "mt-5 flex max-w-[680px] flex-col gap-4 text-[17px] leading-[28px] text-fp-ink";
const HEADING = "text-[26px] font-bold leading-tight text-fp-ink";
const SECTION = "border-t border-fp-border py-12";

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
      <LandingHeader />

      <main className="mx-auto w-full max-w-[900px] px-5 pb-16">
        {/*
         * The banner is the hero and the primary call to action at once. Its headline and
         * "Try it now" are part of the artwork, so the whole image is the link and the alt
         * text carries both the headline and the action.
         */}
        <Link href={TOOL_HREF} className="mt-8 block">
          <Image
            src="/wsis-hero.png"
            alt="Who Should I Start? The question changes every week. Now the answer can too. Try it now."
            width={847}
            height={303}
            priority
            sizes="(max-width: 940px) 100vw, 900px"
            className="h-auto w-full rounded-lg"
          />
        </Link>

        <p className="mb-10 mt-8 max-w-[760px] text-[21px] font-semibold leading-[31px] text-fp-ink">
          Some weeks you’re not picking one player, you’re picking two. Some weeks you need a
          floor, not a ceiling. Tell Who Should I Start? what you need and it recommends the
          combination.
        </p>

        <section className={SECTION}>
          <h2 className={HEADING}>Start the right number</h2>
          <div className={COPY}>
            <p>
              You have two roster spots open and three players who could fill them. Which one do
              you sit?
            </p>
            <p>
              Set <strong className="font-semibold">Players to Start</strong> to the number of
              spots you need to fill. Who Should I Start? counts how often the experts would start
              each player in your situation and recommends the combination, not just the top
              player.
            </p>
          </div>
          <Shot
            src="/wsis-pick-two.png"
            alt="Who Should I Start? filling two spots from three players, with the recommended pair sharing one tile under a single percentage."
            caption="Filling two spots, balanced."
            width={1148}
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
              Set your <strong className="font-semibold">Lineup Goal</strong> to Safe Floor,
              Balanced, or Most Upside and the recommendation moves with it. Same players, same
              spots, a different answer for a different goal.
            </p>
          </div>
          <Shot
            src="/wsis-most-upside.png"
            alt="The same two spots with the lineup goal set to Most Upside, showing a different recommended pair."
            caption="Same two spots, playing for upside."
            width={1125}
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

        <section className="border-t border-fp-border pt-12">
          <p className="text-[21px] font-semibold leading-[31px] text-fp-ink">
            Set the number. Set the goal.
          </p>
          <Link
            href={TOOL_HREF}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-fp-blue px-6 py-3 text-[17px] font-semibold text-white transition-colors hover:bg-fp-blue-bright"
          >
            Get your lineup now
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    </>
  );
}
