---
name: kurzgesagt-style-video
description: Build a Kurzgesagt-style flat-vector explainer in this Remotion project — luminous shapes on a deep space-like field, continuous drifting motion, tiny recurring creatures, cutaway diagrams and scale comparisons, all drawn in code with no photos or stock footage. Use whenever the user asks for a video in the style of Kurzgesagt ("phong cách Kurzgesagt", "In a Nutshell", "vector phẳng vũ trụ"), a calm narrated science/history explainer, an animated flat-vector explainer with glowing shapes on a dark background, or references the millet/"hạt kê" sample built with this skill. Also trigger for tweaking an existing pass — new archetypes, palette changes, retimed beats, caption placement. Covers the visual language, the six scene archetypes, deterministic motion, one-line-several-beats pacing, composition registration, and the Studio check.
---

# Kurzgesagt-style explainer pipeline

A calm, wondrous, flat-vector explainer: luminous shapes on a deep field, everything
always drifting, tiny creatures inhabiting the scenes, and the narration carrying the
argument. `references/example-scene.tsx` is a complete working template with all six
archetypes implemented; `references/visual-language.md` is the palette-and-motion
reference. `src/MilletKurzgesagt.tsx` in this repo is a finished ~68s video built with
this skill — open it to see the whole thing applied to a real script.

**This is the opposite of the mascot-reaction style** next door
(`.claude/skills/linh-vat-video-vox-style`). Do not mix them up:

| | mascot-reaction | this skill |
|---|---|---|
| Imagery | Pexels photos and video | 100% drawn in code, zero assets |
| Cuts | 2-4s, hard, rotating styles | 6-12s beats, long dissolves |
| Text | Big punch text, 3-8 words | Minimal; narration carries it |
| Motion | Springs, bounce, fly-in | Eased drift, orbits, camera push |
| Feel | Fast and funny | Calm and wondrous |

Emulate the general aesthetic — flat vector, cosmic palette, optimistic science — but
never copy a specific studio's characters, assets, or logo.

## 0. Before you start

Repository conventions (checked against `src/Root.tsx` and `src/Composition.tsx`):

- Video files live under `src/` as TypeScript `.tsx`, each exporting a component plus
  `SOMETHING_CANVAS` and `SOMETHING_TOTAL_FRAMES`.
- Compositions are `<Composition>` elements declared in `src/Composition.tsx`;
  `src/Root.tsx` renders those wrappers. Add
  `export const XComposition = () => <Composition ... />` there and render it from
  `RemotionRoot`.
- `npm run lint` runs `eslint src && tsc` under `strict` + `noUnusedLocals`, and the
  eslint config enforces the **Rules of Hooks** — see the lessons section, it matters
  here more than usual.
- `tsc` does NOT cover this skill's `references/` (TypeScript's default include skips
  dot-directories). After editing the template, check it by hand:
  ```bash
  npx tsc --noEmit --strict --noUnusedLocals --jsx react-jsx --esModuleInterop \
    --skipLibCheck .claude/skills/kurzgesagt-style-video/references/example-scene.tsx
  ```

**No external tools are needed.** No Whisper, no rembg, no Pexels, no ffmpeg — this
style draws everything. The only inputs are a script and (optionally) voiceover audio.

## 1. Script and audio

Ask the user for the script, and whether they have voiceover audio. Three cases:

- **Per-scene audio files** (like this repo's `public/audio/scene-*.mp3`) — the easy
  case. Measure each file's real duration and use it as the beat length:

  ```js
  import { parseMedia } from "@remotion/media-parser";
  import { nodeReader } from "@remotion/media-parser/node";
  const { durationInSeconds } = await parseMedia({
    src: "public/audio/scene-01.mp3",
    fields: { durationInSeconds: true },
    reader: nodeReader,
  });
  // durationInFrames = Math.round(durationInSeconds * 30) + 9 padding frames
  ```
  Run this from the project root — `@remotion/media-parser` resolves from
  `node_modules`, so a script parked in /tmp will not find it.

- **One continuous track** — get timestamps however you like (Whisper's `small` model
  works; see the mascot skill for the details) and derive beat boundaries from them.

- **No audio yet** — pick beat lengths from reading pace, roughly 15 Vietnamese
  syllables per 4 seconds, and tell the user the timings will need a pass once the
  real voiceover exists.

Ask the user for canvas orientation: vertical 9:16 (1080×1920, Shorts/TikTok/Reels) or
horizontal 16:9 (1920×1080). Default to vertical to match this repo.

## 2. One line, several beats

Kurzgesagt beats run 6-12 seconds. Narration lines are often longer than that — the
millet script's opening line runs 18s. **Do not hold one image for 18 seconds**, and do
not chop the audio. Split the *visuals* into two or three beats and let the one
narration track play underneath all of them:

```ts
{ id: "hook-seed",   durationInFrames: 300, audio: "audio/scene-01.mp3", audioFrames: 551, ... },
{ id: "hook-desert", durationInFrames: 251, /* no audio: the track above is still playing */ ... },
```

Split the caption at the same point, mid-sentence, with an ellipsis on both halves —
the caption must still match what is actually being said.

## 3. The six archetypes

All implemented in `references/example-scene.tsx`. Rotate them; never repeat one
back-to-back.

1. **cosmicHero** — a full `Planet` with a moon on a visible orbit, god rays, distant
   worlds and a star field. For hooks and for "here is the thing this video is about".
2. **compare** — two `Planet`s sized by the quantities they represent, big numbers
   beneath. For "150 days vs 45 days" moments.
3. **crowd** — a landscape: sunset sky, two parallax hill ranges, a ground curve with
   trees, and a flock of `Bird`s walking across it. For anything about people,
   populations, or migration.
4. **quantity** — a grid of small units showing scale, with a bird beside it for a
   size reference. Label it with a big number **only if the narration actually claims
   that number**.
5. **flowMap** — a drawn path with milestone nodes lighting up in sequence, a
   traveller riding the line, and a bird carrying the cargo below it. For routes,
   spread, and timelines.
6. **cutaway** — concentric rings with a legend, slowly rotating tick marks. For
   anatomy, layers, and "look closer at this".

Choose per beat by asking what the narration wants the viewer to *see*, not by
rotating mechanically — then break ties with the no-repeats rule.

## 4. The visual language

Full detail in `references/visual-language.md`. The short version:

- **Draw things, not primitives.** This is the single biggest tell. A circle with a
  glow is not a planet; a blob with two dots is not a character. The template ships an
  ILLUSTRATION KIT for exactly this reason — use it and extend it rather than reaching
  for a bare `<div>` with a border-radius.
- **Fill the frame.** An empty field around a lone centred object is the most common
  way this style comes out looking cheap. Every beat gets a backdrop, a scenery layer,
  a star field or landscape, the subject, then vignette and grain.
- **Not everything is space.** `mood` picks the backdrop: `space`, `dusk`, `dawn`,
  `day`. The dawn/day horizons carry as much of the style's range as the cosmic ones.
- **Nothing is ever still.** Every beat has a slow camera push; every object has a
  seeded drift or bob; planets rotate; diagrams turn. A frozen element reads as a bug.
- **Ease, never spring.** Springs overshoot and bounce, which is the mascot style's
  register. Use `Easing.out(Easing.cubic)`.
- **Long dissolves, never hard cuts.** `FADE = 20` frames.
- **Text is small and quiet**, except one big number per comparison.

### The illustration kit

| Piece | What it is |
|---|---|
| `Planet` | Ocean gradient, seeded continents each with a clipped inner shadow, optional trees, terminator, bright rim, atmosphere halo. Continents drift and wrap so it reads as rotating. |
| `Bird` | The recurring inhabitant: body, belly, wing, tail, tuft, beak, eyes with highlights, feet. `pose="wave"` animates the wing. |
| `Tree` | Trunk plus a leaf blob with a clipped shade, for ground scenes. |
| `blobPath` | Smooth seeded organic outline — continents, hills, foliage, rocks. |
| `StarField` | Three parallax tiers of dots with occasional 4-point sparkles. |
| `Scenery` | Distant planets and debris. This is the density layer. |
| `LightRays` | Slow god rays, masked at both ends and blurred. |
| `Vignette` / `Grain` | Applied together as `Finish` at the top of every beat. |

Keep characters generic. Emulate the register — flat vector, cosmic palette,
optimistic science — never reproduce a specific studio's character designs or assets.

## 5. Build the video file

Copy `references/example-scene.tsx` to `src/<VideoName>.tsx`, rename the component and
its two exported constants, and replace `SCENES`. Keep the template as the single
source of truth: when you fix something structural, fix it in the template and
regenerate the video file, rather than patching only one of them.

## 6. Register and preview

Add a `<Composition>` wrapper to `src/Composition.tsx` and render it from
`RemotionRoot`, passing `<NAME>_CANVAS.width/height/fps` and `<NAME>_TOTAL_FRAMES`
rather than retyping numbers.

Then verify — this style hides its bugs in stillness, so check motion specifically:

- Render a still mid-way through **every** beat and look at each one.
- Render two frames ~15 frames apart in one beat and confirm things actually moved.
- Render across a beat boundary and confirm the dissolve never dips to black. Mean
  luminance across the boundary should move monotonically between the two scenes'
  levels; a dip below both means the crossfade is broken.
- Check every caption is horizontally centred, especially a SHORT one — see lessons.

`npm run lint` before calling it done. Only render an MP4 if the user asks.

## Things this build got wrong (so you don't repeat them)

Every item below was hit while building `src/MilletKurzgesagt.tsx`.

- **`Math.random()` flickers.** Remotion re-renders every frame, so a star field built
  with `Math.random()` reshuffles 30 times a second. Use the seeded `rand(i)` hash in
  the template, keyed on a stable index.
- **Motion helpers must be pure functions, not hooks.** They get called inside `.map()`
  callbacks and conditional branches, which breaks the Rules of Hooks and fails
  `eslint`. Each scene calls `useCurrentFrame()` **once** at the top and passes the
  number into `ease(frame, ...)` / `float(frame, ...)`.
- **`AbsoluteFill` is `flex-direction: column`.** So `alignItems` is the HORIZONTAL
  axis and `justifyContent` the vertical one — the opposite of the row-flex reflex.
  Getting this backwards left-aligned every caption, and it was invisible until a
  caption was short enough not to fill the width. Measure it rather than eyeballing:
  crop the caption band and compare the bright-pixel bounding box centre to the frame
  centre.
- **In a ROW container, `alignItems: "flex-end"` does not baseline-align two columns** —
  it drops the whole group onto the bottom of the frame, over the caption. To line up
  the numbers under two differently-sized discs, give both discs a box as tall as the
  largest disc instead.
- **Narration belongs at the root, never inside a scene's `<Sequence>`.** A Sequence
  clips its children, so nesting the voiceover inside a visual beat cuts the audio off
  the moment the visuals change — which makes the "one line, several beats" technique
  impossible.
- **Gradient stops on a huge off-screen circle need bunching near 0%.** The crowd
  planet is a 2600px circle whose top ~700px is on screen, so evenly spread stops left
  the entire lower frame bright green with unreadable white captions. Stops now land at
  0/7/16/26%.
- **Purely random placement clumps.** Random x-positions put two or three creatures in
  one overlapping pile most of the time, and random orbit phases bunch the motes on one
  side. Distribute evenly by index and add only a small seeded jitter.
- **SVG labels at the ends of a span run off canvas.** A `textAnchor="middle"` label on
  the first and last node of a flow map gets clipped. Use `start` for the first and
  `end` for the last.
- **A flat translucent circle is not a glow.** `fill={SUN} opacity={0.22}` over a dark
  violet backdrop reads as a grey smudge. Use an SVG `radialGradient` with a fading
  stop-opacity, or the `Glow` div.
- **Use radial-gradient divs for bloom, not giant box-shadow blurs.** Several 400px
  shadow blurs at 1080×1920 visibly drop the Studio preview framerate; gradients are
  effectively free.
- **Never show a number the narration didn't say.** The quantity archetype only renders
  its big number when `unitLabel` is set, precisely so a decorative grid of 84 dots
  doesn't turn into a fabricated statistic on screen.

### From the illustration rebuild

The first version of this skill produced "flat vector shapes on a dark background",
which is not the same thing as this style. These are what closed the gap:

- **A glowing circle is not a planet, and a blob with two dots is not a character.**
  Most of the distance to the real style is in the drawing, not the palette. Build
  the subject out of parts (continents, atmosphere, terminator, rim / beak, wing,
  eye highlight, feet) or it will keep reading as generic flat design.
- **Clip a landmass's shading to the landmass.** An offset darker blob drawn loose
  looks like a second continent overlapping the first. Clipped, the same blob becomes
  an inner shadow hugging the bottom edge — which is what the style actually does.
- **Empty space reads as unfinished, not as calm.** Add the scenery layer before
  concluding a beat looks wrong; more often than not the composition was fine and the
  frame was just bare.
- **Background scenery must stay out of the subject column and every text band**, and
  needs opacity above ~0.2. Dimmer than that, over a dark backdrop, it desaturates
  into grey smudges rather than reading as distant worlds.
- **God rays need masking at BOTH ends plus a blur.** Masked only at the outside, every
  ray converges on one hard point and the result is a mechanical starburst. They should
  be felt, not seen — opacity around 0.2.
- **In a landscape beat, put the ground high enough that characters finish above the
  caption band.** Birds standing at 71% collided with a caption starting at 72%; the
  ground had to come up to 56%. Check this whenever a beat has a horizon.
- **A moon's orbit radius must clear the planet's radius by a real margin**, or it
  spends most of its orbit glued to the limb.
- **Keep the grain frame-independent.** A turbulence seed that changes per frame is a
  large render cost for a texture nobody consciously notices; static, Chromium
  rasterises it once.
