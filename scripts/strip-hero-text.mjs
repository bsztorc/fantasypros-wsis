/**
 * Remove the small baked text from the hero artwork.
 *
 * The banner is a screenshot crop of FantasyPros' Research product pillar, so 847x303 is the
 * highest resolution available for it. The page renders it wider than that, and wider again on
 * a high-DPI display, so the browser upscales it and the baked text softens. Text rendered live
 * by the browser stays crisp, which made the one live line look darker than its neighbours even
 * though the colours were identical: the headline and the label are both #16191d, the same value
 * the live text uses.
 *
 * The fix is to take every small text run out of the artwork and render it live, so nothing
 * crisp sits beside something soft at the same size. The headline stays baked: it is set in
 * Zuume, which is a commercial font, and at that size the softening does not read. The chart
 * icon beside the label stays for the same reason, being a graphic rather than a letterform.
 *
 * The background behind both runs is a single flat colour, #fdb97c, which is FantasyPros' own
 * --product-pillar-background-color for the Research pillar, so covering them is exact rather
 * than a retouch. Boxes were measured off the source by scanning for dark pixels.
 *
 * Source is untracked (`assets/`), so this is a one-off that produced a committed artifact
 * rather than part of the build. It needs `sharp`, which arrives with Next.
 *
 * Run with: node scripts/strip-hero-text.mjs
 */
import sharp from "sharp";

const SOURCE = "assets/WSIS Hero Image.png";
const OUTPUT = "public/wsis-hero.png";

/** The pillar's flat background, sampled from the artwork and confirmed against their CSS. */
const BACKGROUND = { r: 253, g: 185, b: 124, alpha: 1 };

/** Ink bounds plus margin. The icon ends at x=81 and the label starts at x=90. */
const COVER = [
  { label: '"Research" wordmark', left: 85, top: 62, width: 75, height: 24 },
  { label: "tagline", left: 60, top: 156, width: 360, height: 28 },
  { label: 'call to action, arrow at x=145 stays', left: 60, top: 214, width: 80, height: 32 },
];

const patches = await Promise.all(
  COVER.map(async ({ left, top, width, height }) => ({
    input: await sharp({ create: { width, height, channels: 4, background: BACKGROUND } })
      .png()
      .toBuffer(),
    left,
    top,
  })),
);

const { width, height } = await sharp(SOURCE).metadata();
await sharp(SOURCE).composite(patches).toFile(OUTPUT);

console.log(`${SOURCE} ${width}x${height}`);
for (const c of COVER) console.log(`  covered ${c.label} at ${c.left},${c.top} ${c.width}x${c.height}`);
console.log(`wrote ${OUTPUT}`);
