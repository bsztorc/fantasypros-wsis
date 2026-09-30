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

/*
 * Every size below is written phone-first with the desktop value restored at `sm:`, so the
 * page from 640px up renders exactly as it did before. Their 18/32 body is set for an 860px
 * column; on a phone's 335px column it comes out around 34 characters a line, which reads as
 * oversized rather than generous. The phone sizes are one step down with the line height
 * tightened to match, keeping roughly the 1.7 ratio their article type uses.
 */

/** The intro paragraph only. 20px rather than 22px so its longest line clears 860px. */
const LEAD =
  "text-[17px] font-bold leading-[28px] text-fp-ink sm:text-[20px] sm:leading-[34px]";
/** Section headings, and the closing line above the button, which is one of them in kind. */
const HEADING =
  "text-[16px] font-bold leading-[26px] text-fp-ink sm:text-[18px] sm:leading-[32px]";
const COPY =
  "mt-[14px] flex flex-col gap-[14px] text-[16px] leading-[27px] text-fp-ink sm:mt-[18px] sm:gap-[18px] sm:text-[18px] sm:leading-[32px]";
const SECTION = "border-t border-fp-border py-10";

/**
 * A screenshot of the real tool, captured from the frozen Week 3 snapshot.
 *
 * These are captures of a wide desktop UI. From 640px up the shot keeps its full 760px and
 * scrolls sideways inside its own box, because squeezed narrower than that the player names
 * and the percentage stop being readable, which defeats the point of showing them.
 *
 * On a phone that trade stops paying. A 760px shot in a 375px viewport runs 425px past the
 * right edge, so most of what it is meant to show is not on screen at all and the reader has
 * to guess that it drags. Below 640px the shot scales down to the column instead. The names
 * do go small, but the shape of the answer, two players sharing one tile under a single
 * percentage, is what the section is pointing at and that survives the reduction.
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
    <div className="mt-8 overflow-x-auto">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 639px) 100vw, (max-width: 940px) 760px, 860px"
        className="h-auto w-full rounded-lg sm:min-w-[760px]"
      />
    </div>
  );
}

/**
 * The hero, built the way FantasyPros builds theirs: the whole banner is one link.
 *
 * The copy is part of the artwork rather than live text on top of it. Rendering it live was
 * tried and reverted. It measured correctly, landing within two pixels of the ink it replaced,
 * but it did not sit right on screen against the rest of the banner. Since the image is a
 * screenshot crop of their Research pillar and cannot be re-exported larger, one softened
 * image reads better than a mix of soft artwork and crisp live text.
 *
 * The alt text therefore has to carry the headline and the call to action, since nothing in
 * the banner is readable as text.
 *
 * The export it came from carried a 3 to 4px white frame around the artwork, and the artwork
 * itself is a rounded rectangle, so the corners of its bounding box were white too. On the
 * page's grey background both read as a border the banner does not have. The served copy in
 * `public/` is cropped to the artwork and the corners are transparent; the original export in
 * `assets/` is untouched, so anything re-exported from it needs the same treatment.
 */
function Hero() {
  return (
    <Link href={TOOL_HREF} className="mt-8 block">
      <Image
        src="/wsis-hero.png"
        alt="Who Should I Start? The question changes every week. Now the answer can too. Try it now."
        width={840}
        height={296}
        priority
        sizes="(max-width: 940px) 100vw, 860px"
        className="h-auto w-full rounded-lg"
      />
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
              You have two roster spots open and three players who could fill them. Who gets the
              start?
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
              No new rankings. It’s the same Expert Consensus Rankings behind every Who Should I
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
