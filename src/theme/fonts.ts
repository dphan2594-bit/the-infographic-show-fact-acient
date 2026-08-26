import { continueRender, delayRender, staticFile } from "remotion";

/**
 * The channel's one type family.
 *
 * The scenes used to ask for "Arial Black, Arial, sans-serif". Neither font is
 * installed on a render machine, so every headline fell back to Liberation Sans
 * with a browser-synthesised bold — the heavy display weight the design assumed
 * was never actually drawn. Ship the font with the repo instead of naming one
 * and hoping.
 *
 * Be Vietnam Pro is a geometric sans drawn for Vietnamese, so the diacritics
 * are designed rather than bolted on — stacked marks on Ế, Ữ, Ỡ keep their
 * spacing at display size instead of colliding with the cap height.
 */
export const DISPLAY_FONT = '"Be Vietnam Pro", "Liberation Sans", sans-serif';
export const BODY_FONT = DISPLAY_FONT;

const WEIGHTS = [
  [600, "SemiBold"],
  [700, "Bold"],
  [800, "ExtraBold"],
  [900, "Black"],
] as const;

let loaded = false;

/** Registers the family once, and holds the render until the files are in. */
export const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;

  const handle = delayRender("Loading Be Vietnam Pro");
  const style = document.createElement("style");
  style.textContent = WEIGHTS.map(
    ([weight, name]) => `@font-face {
  font-family: "Be Vietnam Pro";
  font-style: normal;
  font-weight: ${weight};
  src: url("${staticFile(`fonts/BeVietnamPro-${name}.ttf`)}") format("truetype");
}`,
  ).join("\n");
  document.head.appendChild(style);

  Promise.all(WEIGHTS.map(([weight]) => document.fonts.load(`${weight} 64px "Be Vietnam Pro"`)))
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};
