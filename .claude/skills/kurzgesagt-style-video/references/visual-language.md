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

## Depth

Four layers, back to front:

1. **Backdrop** — a radial gradient, lighter in the middle, so the frame has a centre.
2. **Star field** — three depth tiers drifting at different rates. Far stars are
   smaller, dimmer and slower. This is the whole parallax budget; it is enough.
3. **Subject** — the archetype's own artwork, with a glow behind it.
4. **Text** — captions and labels, always on top, always with a shadow.

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
