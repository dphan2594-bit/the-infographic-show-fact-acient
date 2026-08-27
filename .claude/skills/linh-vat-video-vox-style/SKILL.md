---
name: linh-vat-video-vox-style
description: Build a mascot-reaction short ("linh vật phản ứng") in this Remotion project from a Vietnamese voiceover (plus optional script) and the user's own mascot expression PNGs — a cartoon character reacting over real Pexels photos/videos, hand-drawn text cards, vox-style diagram explainers, and split-screen "TV reaction cam" layouts. Use whenever the user hands over a voiceover wanting a mascot/character-reaction video, says "làm video linh vật", "video phong cách vox có linh vật", "dùng nhân vật của tôi phản ứng lại audio này", references a prior mascot-reaction video (e.g. the octopus/"bạch tuộc" sample), or mentions character-expression images alongside audio. Also trigger for tweaking an existing pass — new scene styles, swapped expressions, retimed transitions, caption placement, SFX on/off. Covers mascot intake (reuse-vs-upload, never assumes), Whisper transcription, scene segmentation with true crossfades, Pexels sourcing, rotating scene styles, entrance presets, composition registration, live Studio check.
---

# Linh vật video (Vox-style mascot reaction) pipeline

This skill captures a full working pipeline, refined over several rounds of direct
user feedback while building a ~50s reaction short about octopus hearts, narrated in
Vietnamese with a jelly-blob mascot reacting to it.
`references/example-scene.tsx` is that video genericized into a copy-and-rename
template — every technique below is actually applied in it, so open it any time you
want to see a piece of this in working code. `references/mascot-library.md` has the
full detail on the mascot reuse/upload flow summarized in step 1.

The visual target is a fast, funny "reaction video" — NOT a slow explainer. A
consistent mascot character flies in and out of frame reacting to what the narration
just said, over a mix of real stock photos/video, hand-drawn text cards, and diagram
cards. Work through the steps below in order. The only things worth asking the user
about are: which mascot to use (step 1), whether they have an accurate script vs.
relying on Whisper (step 2), and canvas orientation (step 2) — everything else about
the visual style is already decided.

## 0. Before you start

Confirm you're in a Remotion project. **This repository's conventions** (checked
against `src/Root.tsx` and `src/Composition.tsx`):

- Scene/video files live under `src/`, written in **TypeScript (`.tsx`)**, each
  exporting a component plus `SOMETHING_CANVAS` and `SOMETHING_TOTAL_FRAMES`.
- Compositions are declared as `<Composition>` elements inside `src/Composition.tsx`,
  and `src/Root.tsx` renders those composition components. Register a new video by
  adding a small `export const XComposition = () => <Composition ... />` there and
  rendering it from `RemotionRoot` — do NOT put `<Composition>` straight into
  `Root.tsx`, that isn't how this repo does it.
- `npm run lint` runs `eslint src && tsc` under `strict` + `noUnusedLocals`. Note it
  does NOT cover this skill's `references/` — TypeScript's default include skips
  dot-directories — so after editing the template, check it by hand:
  `npx tsc --noEmit --strict --noUnusedLocals --jsx react-jsx --esModuleInterop --skipLibCheck .claude/skills/linh-vat-video-vox-style/references/example-scene.tsx`

If a different project doesn't look like this, read its `src/Root.*` and one existing
scene file to learn its actual conventions before deviating from what's described here.

Check whether whisper is already installed (`python3 -c "import whisper"`) — if
missing, `pip3 install openai-whisper`. Only install rembg + scipy
(`pip3 install rembg onnxruntime scipy`) if step 1 actually finds a mascot image that
needs its background removed — most user-supplied mascot art already comes as a
transparent PNG, and installing rembg unnecessarily just slows things down. All of
this runs locally; nothing here needs an API key or a paid service.

## 1. Mascot asset library — reuse or upload

**Check for an existing library first — never assume this is a first run.** List
`public/mascots/*/` (create the parent dir if it doesn't exist yet).

- **If one or more mascot folders already exist:** ask the user (list the folder
  names, e.g. via a quick multiple-choice question) whether to reuse one of them or
  upload a brand new character. Don't just silently reuse the most recent one — the
  user may be making a video for a different brand or character than last time.
- **If none exist (first run):** ask the user to save their mascot's expression images
  into `public/mascots/<short-name>/raw/` (pick a short kebab-case name together, e.g.
  `octopus-blob`). **Critical: images pasted directly into the chat are NOT accessible
  to you as files** — you can see them, but there is no file on disk you can point a
  script at. Don't waste time searching `/tmp`, `~/Downloads`, or paste-cache folders
  hunting for them; just tell the user plainly that chat-pasted images can't be used
  directly and ask them to drag the files into that folder path (or give you an
  existing path on disk). There's no fixed number of expressions required — three is
  fine, ten is fine, use whatever the user has.

Once files land in `raw/`, Read each one (Read can display images) to confirm what
emotion each conveys and whether it already has a transparent background. Two cases:

- **Already transparent** (most common — most mascot art is exported this way): copy
  straight into `public/mascots/<name>/` under clear emotion-based names you infer
  from the artwork (`happy.png`, `confused.png`, `wink.png`, `worried.png`,
  `cheer.png`, etc. — name them for what they actually show, don't force a fixed list).
- **Still has an opaque/white background:** run
  `python3 .claude/skills/linh-vat-video-vox-style/scripts/mascot_cutout.py public/mascots/<name>/raw/happy.png public/mascots/<name>/happy.png`
  which removes the background and adds a bold black outline (matching the chunky
  cartoon-sticker look this style uses — deliberately different from the
  vox-collage skill's white paper-sticker edge, which would disappear against a light
  scene background here).

See `references/mascot-library.md` if any of this is ambiguous (e.g. the user wants to
rename/delete an old library, or half the set is transparent and half isn't).

## 2. Voice, script, and canvas

Copy the provided audio file into `public/` under a short name. Ask the user two quick
things if not already clear from context: **do they have an accurate script** to go
with the audio (prefer that as the literal displayed/narration text — Whisper's
Vietnamese transcription is usable for timing but regularly mishears words, e.g.
"ảo ma Canada" → "ở Mắc Canada"), and **do they want horizontal 16:9 (1920×1080) or
vertical 9:16 (1080×1920)**.

Transcribe with Whisper for word/segment-level timestamps — use the **small** model,
not `base`. `base` was tried first and its Vietnamese transcription was rough enough to
be unusable even just for eyeballing segment boundaries; `small` is noticeably more
accurate and still fast enough on CPU for a ~1 minute clip.

```python
import whisper, json
model = whisper.load_model("small")
result = model.transcribe("public/audio.mp3", word_timestamps=True, language="vi")
json.dump(result, open("/tmp/transcript.json", "w"), ensure_ascii=False)
```

## 3. Segment into scenes

Whisper's segments often split a single sentence into two pieces mid-clause (it tends
to do this after a comma-like pause) — merge those back into one scene rather than
treating every raw segment as its own cut. Chain scenes back-to-back from the real
timestamps (scene N+1 starts where scene N's speech starts, not with a gap) so there's
no dead air, and cap every scene at **5-10 seconds — an upper bound, not a target**.
Shorter scenes (2-4s) are good and often better for pacing; the constraint exists to
stop any single scene from dragging, not to pad scenes out to some minimum.

For each scene decide:

- **Punch text** — a SHORT highlight (3-8 words), not the full sentence. The voiceover
  already carries the complete sentence; the on-screen text is a punchy visual
  highlight synced to it, matching the reference style (think "3 TIM?!", not a
  paragraph). Keep every scene's text container inside the **eye-level band** —
  roughly the middle 60-70% of the frame's height — never pinned to the very top or
  bottom ~15% margin. This is easy to violate by accident once a layout gets crowded
  (e.g. squeezing text next to a big video frame); double-check it after building.
- **Scene style** — rotate through the 6 styles below so no two consecutive scenes
  repeat the same one. With more than 6 scenes some styles will repeat overall —
  that's fine, just never back-to-back.
- **Mascot expression + entrance direction** — pick whichever expression actually fits
  that line's emotion, and rotate through the entrance presets (see step 5) so the
  mascot never flies in the same way twice in a row. This is what makes it feel "bay
  lung tung, chuyển động sinh động" (flying around, lively) instead of a static
  talking head with a logo stuck in the corner.
- **What stock asset (if any)** that style needs — see step 4.

The 6 scene styles (all implemented in `references/example-scene.tsx`):

1. **Real photo** — mascot in a corner over a real Pexels photo, slow Ken-Burns zoom,
   gradient overlay for text legibility.
2. **White/tinted + hand-drawn frame** — solid background, thick wobbly hand-drawn SVG
   border, big pop-in text. Good for hook questions and punchlines.
3. **Vox diagram** — light dotted background, mascot explaining next to a simple
   diagram element (an animated heart icon in the worked example; swap in whatever icon
   fits the content — an arrow, an icon, a mini chart).
4. **Comic speech bubble** — colour-gradient background, mascot and a comic-style
   speech bubble laid out as **one centered flex group with a fixed gap** (not two
   independently-positioned halves — see the lessons section for why that matters).
5. **Video + reaction-cam bubble** — a real Pexels video clip full-bleed, with the
   mascot reacting in a small rounded bubble in a corner, like a streamer's webcam
   overlay.
6. **TV-frame split screen** — the video clip sits inside a black TV-bezel frame on one
   side of the canvas, mascot + text on the other side, like a real reaction-video
   layout.

## 4. Source Pexels photos/videos

Same technique as the vox-collage-video skill (no API key needed): navigate to
`https://www.pexels.com/search/<url-encoded query>/` for photos or
`https://www.pexels.com/search/videos/<url-encoded query>/` for video, read the results
page, and grab the direct download link — photos are a plain
`images.pexels.com/.../pexels-photo-....jpeg` URL you can `curl` straight into
`public/`; videos are a `pexels.com/download/video/<id>/` link that needs
`curl -sL ... -A "Mozilla/5.0"` to follow the redirect.

Pexels videos often come down as large 4K files at an unhelpful frame rate. Trim and
re-encode to match the composition before wiring it in — this keeps Studio's live
preview smooth and the repo size sane:

```bash
ffmpeg -y -i raw_video.mp4 -t 8 -vf "scale=<canvas_w>:<canvas_h>" -r 30 \
  -c:v libx264 -crf 20 -an public/<name>_clip.mp4
```

Pick a video long enough (or with `startFrom` offsets varied across the scenes that
reuse it) to give each scene visibly different footage rather than the exact same few
seconds every time.

## 5. Build the scene file

Copy `references/example-scene.tsx` to `src/<VideoName>.tsx`, rename the component and
its two exported constants, and fill in the scene list from step 3. The file's comments
explain each piece; the mechanics worth understanding before you touch it:

- **`ENTER_PRESETS` / `Mascot`** — 9 spring-driven flight-in directions (`fall`, `top`,
  `bottom`, `left`, `right`, `spin`, `drift`, `bigBounce`, `pop`), each translating +
  rotating + scaling in from off-screen, plus a continuous idle bob/wobble once landed
  so the mascot never sits frozen mid-scene. Add more presets here if a line calls for
  a motion none of the nine quite capture — don't just default back to `pop` for
  everything.
- **`PunchText`** — short highlight text, spring pop-in. Always check where it lands
  relative to the eye-level band described in step 3.
- **`Reveal`** — the crossfade wrapper. Read the comment on it and the lessons-learned
  section below before changing it; it's easy to accidentally reintroduce the
  black-flash bug by "simplifying" it.
- **`Video`** (not `OffthreadVideo`) for any scene with a video clip.
- **No SFX** — don't add sound effects, `<Audio src={staticFile('sfx/...')}>` or
  similar, unless the current user request explicitly asks for them.
- Keep the canvas at whatever size/orientation was picked in step 2, 30fps unless the
  user specifies otherwise.

## 6. Register and preview

Add the import + a `<Composition>` wrapper in `src/Composition.tsx` and render it from
`RemotionRoot` in `src/Root.tsx`, matching the exact pattern
`InfographicComposition` already uses. Pass `<NAME>_CANVAS.width/height/fps` and
`<NAME>_TOTAL_FRAMES` rather than re-typing the numbers.

Then verify in Remotion Studio (`npm run dev`, then open
`http://localhost:<port>/<CompositionId>`):

- Scrub through every scene with screenshots.
- Scrub to at least one **transition boundary** (a frame a few frames before and after
  a scene's content boundary) and confirm the two scenes visibly dissolve into each
  other **with no black flash** in between.
- For any scene with a video clip, actually press Play for a second or two and take two
  screenshots a moment apart — confirm the footage is visibly advancing, not frozen
  (the `OffthreadVideo`-during-live-playback symptom from the lessons below).

Don't render an MP4 as the verification step — the Studio preview already plays audio
and every animation live, and it's much faster to iterate on. Only render if the user
asks for an exported file.

Run `npm run lint` before you call the build done.

## Things earlier attempts got wrong (so you don't repeat them)

- **Whisper `base` mis-hears a lot of Vietnamese.** Use `small`, and prefer a
  user-supplied script as the actual displayed/narration text whenever one exists —
  Whisper is there for timing, not transcription accuracy.
- **Chat-pasted images are not files.** You can see them, but there is nothing on disk
  to point a script at. Ask for a real path or a folder drop immediately rather than
  searching for them.
- **Fading each scene independently to black is not a crossfade.** It's two separate
  fades with a gap of exposed black canvas in between, which reads as a jarring flash.
  The fix implemented in `Reveal`: each scene's `<Sequence>` starts `FADE` frames early,
  overlapping the previous scene's still-fully-opaque tail, and only fades **in**; later
  scenes paint on top of earlier ones in JSX order, so the outgoing scene just gets
  covered rather than needing to fade out itself. Only the very last scene in the whole
  video also fades out, for a clean ending.
- **`OffthreadVideo` freezes during live Studio playback.** It's the right choice for
  frame-accurate final renders, but during real-time preview playback it can visibly
  stutter/freeze on ordinary clips. Use `Video` for anything meant to be scrubbed or
  played live in Studio.
- **Two independently-centered layers don't reliably balance a layout.** Positioning a
  mascot with `marginRight` and a separate element with `marginLeft`, each centered in
  its own full-width container, can collide on one side while leaving the other side of
  the frame empty depending on content width. Lay related elements out as **one flex
  group with a fixed gap** instead — it centers as a unit and can't drift apart or
  collide. This was a direct user-reported bug ("phần linh vật bị dính vào bảng chữ,
  phần còn lại bị trống") on the first version of the comic-bubble scene. See
  `SceneComicBubble` in `references/example-scene.tsx` for the fix.
- **A caption that drifts to the very top or bottom of frame is an easy accident**, not
  a deliberate choice — it happens once a scene's layout gets busy (e.g. squeezing text
  in next to a big video frame). Explicit user requirement: keep it at eye level,
  always.
- **Don't add sound effects unless asked.** They were added once (procedurally
  synthesized, wired to entrance/reveal beats) and then the user explicitly asked to
  remove them. Treat SFX as opt-in per request, not a default part of this style.
