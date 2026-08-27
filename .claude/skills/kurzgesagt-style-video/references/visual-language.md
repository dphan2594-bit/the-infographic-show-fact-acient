# Visual language

The palette, motion and layout rules behind the Kurzgesagt-style pipeline. All of it is
implemented in `example-scene.tsx` — this file explains *why*, so you can extend the
style without breaking it.

## Palette

A near-black field with a violet or navy cast, and objects that look lit from within.

| Token | Hex | Use |
|---|---|---|
| `SPACE` | `#0B1026` | cool backdrop centre |
| `SPACE_DEEP` | `#070A1A` | backdrop edge, and the composition's base colour |
| `SPACE_WARM` | `#1B1040` | violet backdrop centre, for warmer beats |
| `CORAL` | `#FF5A5F` | alert, contrast accent, "the problem" |
| `AMBER` | `#FFB43A` | primary warm subject |
| `SUN` | `#FFE066` | highlights, the travelling dot, the chosen creature |
| `MINT` | `#3DDC97` | life, growth, planets |
| `TEAL` | `#2EC4E6` | water, the "slow"/baseline side of a comparison |
| `VIOLET` | `#8B5CF6` | outer layers, structure |
| `PINK` | `#FF7ECD` | routes, movement |
| `TEXT` | `#EEF2FF` | captions |
| `TEXT_DIM` | `#9BA7C7` | labels, legends |

Rules:

- **Two accents per beat, three at most.** More and it stops reading as one system.
- **Backdrop stays dark.** If a large object needs to be bright, make it small and let
  the glow do the work.
- **Never put a mid-tone object behind a caption.** White text on mid-green or
  mid-amber is unreadable — darken the object's gradient in that band instead.

## Moods

Not every beat is outer space — that was the biggest thing missing from the first pass
of this style. `mood` selects the backdrop:

| Mood | Backdrop | Use |
|---|---|---|
| `space` | deep navy radial | cosmic scale, hooks, diagrams |
| `dusk` | violet radial | routes, comparisons, anything reflective |
| `dawn` | warm orange horizon over violet | landscapes, people, journeys |
| `day` | bright teal horizon | daylight ground scenes |

`dawn` and `day` are linear top-to-bottom gradients, so they read as a sky with a
horizon rather than as a void.

## Depth

Six layers, back to front. Skipping the middle ones is what makes a frame look bare:

1. **Backdrop** — the mood gradient.
2. **Light rays** — slow god rays from the light source. Masked at both ends and
   blurred, opacity ~0.2. Felt, not seen.
3. **Scenery** — distant planets and debris in the outer thirds and upper half. This is
   the density layer, and the most commonly skipped one.
4. **Star field / landscape** — three parallax tiers of stars, or hills and ground.
5. **Subject** — the archetype's artwork, with a glow behind it.
6. **Text**, then **vignette + grain** over everything.

## The illustration kit

The style lives here more than in the palette. `Planet` is a body with an ocean
gradient, seeded continents (each with its shading *clipped to the landmass*, so it
reads as an inner shadow rather than a second overlapping continent), optional trees,
a terminator, a bright rim and an atmosphere halo — its continents drift and wrap,
which reads as rotation without the flat-spinning-disc look. `Bird` has a body, belly,
wing, tail, tuft, beak, eyes with highlights and feet; two dots on a blob is not
enough to carry a scene. `Tree` and `blobPath` cover ground scenery.

Extend the kit rather than dropping in bare primitives. A `<div>` with
`border-radius: 50%` is the fastest way back to generic flat design.

## Motion

The rule that matters most: **nothing is ever completely still.** A static frame in
this style does not read as calm, it reads as broken.

- **Camera push** — every beat scales 1 → ~1.06-1.12 across its whole length, or
  reverses. Slow enough that you only notice it if you look for it.
- **Object drift** — `float(frame, seed)` gives each object its own phase so a group
  never pulses in unison.
- **Orbits** — motes ride the ring radii, at evenly spaced phases.
- **Entrance** — `ease(frame, delay, duration)` with `Easing.out(Easing.cubic)`, and a
  scale from ~0.85 rather than from 0. Stagger group members ~4 frames apart.
- **Never springs.** Overshoot and bounce belong to the mascot-reaction style. If
  something feels too flat, lengthen the ease, don't add bounce.
- **Dissolves, not cuts** — `FADE = 20`. Each beat starts 20 frames early over the
  previous beat's still-opaque tail and only fades in, so black is never exposed. Only
  the final beat fades out.

## Layout

- **Caption band:** `top: 72%`, `height: 18%`. Below the artwork, above phone UI chrome.
  Never in the bottom 10%.
- **Subject band:** the middle, usually nudged up 4-12% so it doesn't crowd the caption.
- **Group related elements in one flex container with a fixed gap.** Two
  independently-positioned halves drift apart or collide depending on content width.
- **Equal-height boxes when comparing.** Two differently-sized discs need equal-height
  containers, or their labels land at different heights.
- Remember `AbsoluteFill` is `flex-direction: column`: `alignItems` is horizontal,
  `justifyContent` is vertical.

## Creatures

The recurring inhabitants: a rounded body, two dot eyes, two small feet, bobbing on a
seeded phase. Keep them **simple and generic** — the appeal is that they're barely more
than a blob, and it keeps the design original rather than borrowed. Vary colour and
size across a crowd; highlight at most one with a glow.

## Typography

- One family throughout, weights 500/600/800. **No webfont is bundled**: the
  template's stack (`Inter`, then `system-ui`, then `sans-serif`) resolves to whatever
  sans-serif the rendering machine provides, which means the same project can render
  with different letterforms on a designer's laptop and in CI. Vietnamese diacritics
  render correctly on the fallback — that has been checked — but if the user wants the
  look pinned, add a real font (`@remotion/google-fonts`, or `@font-face` against a
  file in `public/`) and put its family first in `FONT`.
- Caption 52px / line-height 1.35 at 1080 wide. Big numbers 96px/800. Labels 30-38px in
  `TEXT_DIM`.
- Small-caps-style labels get `letterSpacing: 3` and `textTransform: uppercase`.
- Always give captions `textShadow` — they sit over artwork that changes brightness.

## Extending the style

When a beat needs something the six archetypes don't cover, build the new one from the
same parts: `SpaceBackdrop` + `StarField` + a subject group with `Glow` + `Caption`,
with `cameraPush` on the subject layer and `float` on each object. Add it to the
`Archetype` union and the `SceneBody` switch — the switch has no `default` on purpose,
so TypeScript will point at the missing case.
