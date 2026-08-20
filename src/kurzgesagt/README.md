# WhyRomeFell — flat-vector explainer

A 1920×1080, ~52-second animated explainer on the fall of the Roman Empire,
in the flat-vector science-explainer visual language: deep space ground,
a small set of highly saturated accents, flat geometric shapes, spring easing.
Everything is drawn in code — no image or video assets.

## Running it

```bash
npm run dev                                    # Remotion Studio
npx remotion render WhyRomeFell out/rome.mp4   # render
```

In a sandbox that can't download Remotion's headless Chrome, point at a local
Chromium first:

```bash
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

## Layout

| File | Role |
| --- | --- |
| `theme.ts` | palette, per-cause accent colours, scene durations |
| `anim.ts` | shared entrance springs and ramps |
| `font.ts` | loads Nunito (latin + vietnamese subsets) from `public/fonts` |
| `components/` | background, typography, orb, stat, per-cause chrome |
| `scenes/` | one file per scene |
| `RomeVideo.tsx` | scene order and cross-fades |
| `Composition.tsx` | registers the `WhyRomeFell` composition |

Scene lengths live in `sceneDurations` in `theme.ts`. `getRomeDurationInFrames`
subtracts one transition per cut, since `TransitionSeries` overlaps neighbours.

## Editing

- **Copy**: on-screen text is inline in each scene file.
- **Timing**: `sceneDurations` for scene length; the `delay` prop on each
  element for entrance order within a scene.
- **Colour**: `palette` and `causeColors` in `theme.ts`. Each of the four
  causes keeps its accent every time it reappears, including in the outro
  stack — change it in one place.

## Figures used

| Scene | Figure | Note |
| --- | --- | --- |
| Peak | ~5M km², ~70M people, ~25% of world population, AD 117 | greatest extent under Trajan; population estimates vary widely |
| Overreach | ~8,000 km of frontier, ~30 legions | standing legion count under the Principate |
| Money | denarius silver: 98% → 85% → 50% → 15% → 2% | approximate; varies by hoard and issue. Later figures are the antoninianus that replaced the denarius |
| Politics | 26 emperors, AD 235–284 | Crisis of the Third Century; the count depends on which claimants are included |
| Split | AD 395 | division under Theodosius I |
| Fall | 4 Sept AD 476; East lasts to 1453 | deposition of Romulus Augustulus |

The money and politics figures are rounded consensus values chosen to show the
shape of the trend, not exact assays or an agreed regnal list.

## Style note

This is the general flat-vector explainer idiom — it deliberately does not
reproduce any studio's signature characters, mascots, or logo.
