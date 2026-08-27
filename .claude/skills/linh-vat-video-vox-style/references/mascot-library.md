# Mascot asset library

Step 1 of `SKILL.md` in full. Read this when the intake isn't the straightforward
"first run, user drops transparent PNGs" case.

## Layout on disk

```
public/mascots/
  octopus-blob/
    raw/            <- exactly what the user handed over, never modified
      happy.png
      shocked.png
    happy.png       <- processed, transparent, ready for staticFile()
    shock.png
  cat-ceo/
    raw/
    ...
```

Two rules that matter:

- `raw/` is the untouched original. Keep it. If a cutout comes out wrong you re-run
  from `raw/`, and if the user later wants a different outline weight you still have
  the source.
- The processed files sit at the folder root and are named for **the emotion they
  actually show**, not for a fixed checklist. `wink.png`, `facepalm.png`,
  `mind-blown.png` are all fine names if that's what the art shows. The scene list
  references these names, so a wrong name means the wrong face on the wrong line.

`MASCOT_DIR` in the scene file points at one of these folders
(`mascots/<short-name>`), so switching characters is a one-line change.

## Deciding: reuse or upload

**Always list `public/mascots/*/` first.** Never assume this is a first run and never
silently reuse the newest folder — the user may be making this video for a different
brand or character.

- **Folders exist** → ask which to use, listing the names, with "upload a new
  character" as an explicit option. A multiple-choice question is the fastest way.
- **No folders** → first run. Agree a short kebab-case name with the user
  (`octopus-blob`, `cat-ceo`) and ask them to put the expression images in
  `public/mascots/<name>/raw/`.

**Images pasted into the chat are not files.** You can see them, but there is nothing
on disk for a script to open. Say so immediately and ask for either a folder drop or
an existing path — do not go searching `/tmp`, `~/Downloads`, or paste-cache
directories, that has never once worked and only wastes the user's time.

## Processing what lands in `raw/`

Read each image (Read renders images) and note two things: what emotion it conveys,
and whether the background is already transparent.

- **Transparent** — the common case, most mascot art is exported this way. Copy it
  straight to `public/mascots/<name>/<emotion>.png`. No script, no rembg install.
- **Opaque / white background**:

  ```bash
  python3 .claude/skills/linh-vat-video-vox-style/scripts/mascot_cutout.py \
    public/mascots/<name>/raw/happy.png public/mascots/<name>/happy.png
  ```

  This needs `pip3 install rembg onnxruntime scipy pillow numpy`. Only install it when
  you've actually found an image that needs it.
- **Transparent but no outline, and it disappears against light scene backgrounds** —
  run the same script with `--keep-bg`, which skips rembg and only adds the outline.

`--outline N` sets the edge thickness (default 14px, `0` disables). The outline is
deliberately **black and chunky** — this style puts mascots over cream cards, dotted
diagram backgrounds and bright gradients, and the white paper-sticker edge used by the
vox-collage style vanishes on all three.

## Mixed and awkward cases

- **Half the set is transparent, half isn't** — process each file the way it needs;
  don't run everything through rembg for consistency. rembg on already-transparent art
  can eat thin details (antennae, whiskers, a thin tail).
- **Two expressions read as the same emotion** — keep both, name them for the
  difference you can actually see (`happy.png` / `happy-big.png`) rather than picking
  a winner. More faces means less repetition across scenes.
- **The user wants to rename or delete an old library** — confirm which folder before
  removing anything, and check no scene file still points at it
  (`grep -rn "mascots/<name>" src/`).
- **Only one or two expressions exist** — that's workable. Lean harder on the entrance
  presets and scene styles for variety, and tell the user which extra emotions would
  most improve the video (usually a shock/surprise and a deadpan).
