---
name: flat-explainer
description: Build, pace and render Vietnamese flat-vector explainer scenes in this repo (Remotion). Use whenever the task involves a scene JSON in content/, an overlay or camera in src/, the animation table for the SI_NONG_CONG_THUONG series, or rendering an InfographicWide/Infographic composition — including "make it more Kurzgesagt", "add animation", "add transitions", "render this batch".
---

# Flat explainer — the channel's production system

Three documents, each answering a different question. Read the one the task
needs; do not work from memory of them.

| Question | Document |
|---|---|
| What should the still picture *be*? | `docs/SKILL-FLAT-EXPLAINER.md` — visual funnel, archetypes E1–E10, palettes, thumbnail formula |
| How should it *move and be paced*? | `docs/PLAYBOOK-KENH-LON.md` — the big-channel benchmarks, verbatim as the user supplied it |
| How is a batch rendered? | `docs/BATCH-PIPELINE.md` |

`docs/PLAYBOOK-KENH-LON.md` is the user's own research and is kept verbatim.
Do not edit it. Anything learned from it that belongs in code belongs in
`scripts/check-pacing.mjs` or in this file.

## Measure, do not eyeball

    node scripts/check-pacing.mjs content/<file>.json

It reports seconds per illustration, beats per minute inside one, how long
every piece of text is held, flash frequency and colours per scene, and exits
non-zero on a violation. Run it before rendering — a render is 20+ minutes and
a pacing mistake is invisible until it is finished.

Verify the render itself the same way: pull stills at the beat boundaries with
ffmpeg and look at them. Every real defect found in this repo so far — a
callout ring standing on its end, camera moves landing a beat late, a headline
re-wrapped into four lines, a diacritic clipped by its own plate — was found in
a rendered frame and would not have been found by reading the JSON.

## The numbers this repo is held to

- **12–20 s per illustration**, 3–5 image changes per minute. A scene that holds
  one picture for 40 s fails this however busy its beats are; split it into
  sub-clips at different framings, or ask for another illustration.
- **6+ beats per minute inside a picture**, or it reads as a slide.
- **A pattern interrupt every 2–4 minutes** — a chapter card, a music change.
- **Text held ≥ 0.5 s**; nothing flashing faster than 3 Hz.
- **≤ 6 colours per scene.**
- Ken Burns changes direction every 3–5 s; roughly 20–25 % of scenes animate.

## Motion, measured against the reference

`scripts/measure-reference.mjs` reads a video's pacing; the same per-frame
energy sampling comparing our render to a Kurzgesagt short is what settled how
this repo animates. What it showed, in order of how much it mattered:

- **Dynamic range beats amount.** Their frames are flat and then explode: median
  motion 0.69, p90 5.50. Ours drifted constantly and never went anywhere —
  median 0.27, p90 0.69. A camera always creeping plus a sprite always breathing
  is mush, because no accent rises above it. Hold the frame dead still, then
  move hard.
- **A held frame still deforms.** Their shapes never stop warping even when
  nothing is happening. A bitmap cannot redraw itself but it warps affinely, and
  `sprite`'s `alive` does exactly that — non-uniform scale plus skew on two
  periods that do not divide into each other, so it never ticks. Measured tight
  around one of our figures, this reaches 0.59 against their 0.69.
- **Frame the subject, not the tableau.** Whole-frame liveliness was still 0.15
  when the same animation measured 0.59 around the figure itself: the subject
  only occupied a corner. Push in until it fills the shot. This alone took the
  whole-frame number from 0.15 to 0.26 and p90 past theirs.
- **Fast moves need blur.** `motionBlur` samples `getPresetStyle` a frame back
  and smears by how far the sprite actually travelled. Sharp frames on a fast
  move strobe.
- **`weight`** stretches along the travel while accelerating and squashes on the
  frame it stops, anchored at the feet — mass, without touching the artwork.

Still not done, all needing per-part rigging: anticipation (nothing winds up
before it moves), arcs (drops are straight vertical), and follow-through on
sub-parts (a held scroll does not lag the hand carrying it).

## Type

One family, shipped in the repo: `src/theme/fonts.ts` (Be Vietnam Pro, loaded
through `delayRender`). Never name a font that is not in `public/fonts` — the
render machine has 59 fonts and Arial is not among them, so a named fallback
silently becomes Liberation Sans with a synthesised bold.

Vietnamese stacks a tone mark above the vowel's own diacritic, so display type
needs `lineHeight` ≥ 1.16 and matching plate padding. At 1.02 the plate clips
the tilde off Ĩ.

## Making a character move

`cutout` lifts a rectangle of the picture, so its motion is capped at a couple
of percent — past that the copy slides off its own outline. For a character
that has to act, cut it out properly:

    python3 scripts/cut-sprite.py <image> <x0> <y0> <x1> <y1> <out-prefix> \
        [--arm x0 y0 x1 y1] [--drop x y]...

It writes an alpha PNG, a plate with the hole patched, and optionally a limb
split onto its own pivot. Then use the `sprite` overlay. Keep a limb's swing
under about 15° or the joint tears open.

## Determinism

Every frame renders in its own browser, so `Math.random()` boils. Seed
everything through `src/animation/random.ts`.

A camera can only pan `(1 - 1/zoom) / 2` before the artwork's edge enters
frame, so at zoom 1.25 a subject can be leaned toward but not centred. Point
with a `spotlight` or `calloutRing`, which are image-locked and land exactly.

## Authoring beats

Write camera poses in **frames**, not percentages, and convert — beats are in
frames, and authoring the two in different units puts every move a beat late.

Overlays are image-locked by default and travel with the camera; the set in
`FRAME_LOCKED` (`src/components/Scene.tsx`) stays put. Text must be
frame-locked or the camera drags it out of the title-safe area; anything
pointing at the artwork must not be.
