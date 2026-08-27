/**
 * example-scene.tsx — copy-and-rename template for the "Kurzgesagt-style explainer"
 * pipeline.
 *
 * HOW TO USE
 *   1. cp this file to src/<VideoName>.tsx
 *   2. Rename KgExample -> <VideoName>, and the two exported constants
 *      KG_CANVAS / KG_TOTAL_FRAMES -> <NAME>_CANVAS / <NAME>_TOTAL_FRAMES.
 *   3. Replace SCENES with your own list, and point each beat at its voiceover.
 *   4. Register it in src/Composition.tsx (see step 6 of SKILL.md).
 *
 * Everything here is drawn with SVG + CSS. There are NO image or video assets: this
 * style is 100% flat vector, so the whole video is code.
 *
 * The file has three layers, and they are worth keeping separate in your head:
 *   ILLUSTRATION KIT  — Planet, Bird, trees, hills: the things being drawn.
 *   ATMOSPHERE        — starfield, scenery, light rays, vignette, grain: the layers
 *                       that make a frame feel inhabited rather than empty.
 *   ARCHETYPES        — six scene compositions built from the two above.
 */

import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

/* ------------------------------------------------------------------ *
 * Canvas
 * ------------------------------------------------------------------ */

export const KG_CANVAS = { width: 1080, height: 1920, fps: 30 } as const;

/** Long, soft dissolves. This style never hard-cuts. */
const FADE = 20;

/* ------------------------------------------------------------------ *
 * Palette
 * ------------------------------------------------------------------ */

const CORAL = "#FF5A5F";
const AMBER = "#FFB43A";
const SUN = "#FFE066";
const MINT = "#3DDC97";
const TEAL = "#2EC4E6";
const VIOLET = "#8B5CF6";
const PINK = "#FF7ECD";

const TEXT = "#EEF2FF";
const TEXT_DIM = "#9BA7C7";

/**
 * No webfont is bundled, so this resolves to whatever sans-serif the render machine
 * has. Vietnamese diacritics come out correctly on the usual fallbacks, but the
 * letterforms are NOT pinned across machines — add a real font and put it first here
 * if the look needs to be reproducible.
 */
const FONT = "'Inter', system-ui, sans-serif";

/**
 * Backdrops. Not every beat is outer space — that was the single biggest thing
 * missing from the first pass of this style. `dawn` and `day` put the same shape
 * language over a horizon, which is half of what makes the look feel varied.
 */
const MOODS = {
  space: { inner: "#141B3D", outer: "#05070F", haze: "#2A3670" },
  dusk: { inner: "#3A1E5C", outer: "#0C0820", haze: "#6B3FA0" },
  dawn: { inner: "#FF9E5E", outer: "#241448", haze: "#FF7E5E" },
  day: { inner: "#5CC8EE", outer: "#123E63", haze: "#9BE3FF" },
} as const;

type Mood = keyof typeof MOODS;

/* ------------------------------------------------------------------ *
 * Deterministic randomness
 * ------------------------------------------------------------------ */

/**
 * Remotion re-renders the component on EVERY frame, so `Math.random()` returns a
 * different value each frame and any star field built with it flickers violently.
 * Every "random" value in this file comes from this hash of a stable index instead,
 * so frame N always looks identical however many times it is rendered.
 */
const rand = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Smooth closed organic blob through seeded polar points. Continents, hills, rocks. */
const blobPath = (
  cx: number,
  cy: number,
  r: number,
  seed: number,
  points = 8,
  wobble = 0.5,
): string => {
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 - wobble / 2 + rand(seed * 13 + i) * wobble);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  const first = pts[0];
  const last = pts[points - 1];
  let d = `M ${(first[0] + last[0]) / 2} ${(first[1] + last[1]) / 2}`;
  for (let i = 0; i < points; i++) {
    const cur = pts[i];
    const next = pts[(i + 1) % points];
    d += ` Q ${cur[0]} ${cur[1]}, ${(cur[0] + next[0]) / 2} ${(cur[1] + next[1]) / 2}`;
  }
  return `${d} Z`;
};

/* ------------------------------------------------------------------ *
 * Motion primitives — PURE FUNCTIONS, not hooks
 * ------------------------------------------------------------------ */

/*
 * These take `frame` as an argument instead of calling useCurrentFrame() themselves.
 * That matters: they get used inside .map() callbacks and conditional branches, and
 * a hook called from a loop or a conditional breaks the Rules of Hooks (eslint
 * react-hooks fails the build). Each scene component calls useCurrentFrame() ONCE at
 * the top and passes the number down.
 */

/**
 * Smooth entrance, 0 -> 1. Deliberately NOT a spring: springs overshoot and bounce,
 * which reads as playful/cartoon. This style eases in and settles.
 */
const ease = (frame: number, delay: number, duration = 34): number =>
  interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/** Continuous float, seeded so each object drifts on its own phase. */
const float = (frame: number, seed: number, amp = 12, speed = 1) => ({
  x: Math.sin(frame / (52 / speed) + rand(seed) * Math.PI * 2) * amp,
  y: Math.cos(frame / (67 / speed) + rand(seed + 91) * Math.PI * 2) * amp,
});

/** Slow continuous push so no scene ever sits perfectly still. */
const cameraPush = (frame: number, durationInFrames: number, from = 1, to = 1.08) =>
  interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateRight: "clamp",
  });

/* ================================================================== *
 * ILLUSTRATION KIT
 * ================================================================== */

/**
 * A planet, not a circle. The difference between this and a flat disc with a glow is
 * most of what separates this style from generic "flat vector on dark".
 *
 * Built from: ocean gradient, seeded continents each with an inner bottom shadow,
 * optional trees, a soft terminator toward the lower-right, a bright rim, and an
 * atmosphere halo. Continents drift horizontally and wrap, which reads as rotation
 * without the flat-spinning-disc look of rotating the whole group.
 */
const Planet: React.FC<{
  size: number;
  ocean: string;
  land: string;
  landShade: string;
  atmosphere: string;
  seed?: number;
  spin?: number;
  detail?: "none" | "trees";
  continents?: number;
  frame: number;
}> = ({
  size,
  ocean,
  land,
  landShade,
  atmosphere,
  seed = 1,
  spin = 0.06,
  detail = "trees",
  continents = 5,
  frame,
}) => {
  const uid = `pl${seed}`;
  const R = 95;
  const shift = ((frame * spin) % 200) - 100;
  const list = Array.from({ length: continents }, (_, i) => i);

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`${uid}-ocean`} cx="34%" cy="28%">
          <stop offset="0%" stopColor={ocean} stopOpacity={1} />
          <stop offset="100%" stopColor={ocean} stopOpacity={0.72} />
        </radialGradient>
        <radialGradient id={`${uid}-term`} cx="34%" cy="28%">
          <stop offset="70%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#0A1024" stopOpacity={0.4} />
        </radialGradient>
        <radialGradient id={`${uid}-atmo`}>
          <stop offset="70%" stopColor={atmosphere} stopOpacity={0} />
          <stop offset="79%" stopColor={atmosphere} stopOpacity={0.34} />
          <stop offset="86%" stopColor={atmosphere} stopOpacity={0.12} />
          <stop offset="100%" stopColor={atmosphere} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <circle cx="100" cy="100" r={R} />
        </clipPath>
      </defs>

      <circle cx="100" cy="100" r="120" fill={`url(#${uid}-atmo)`} />
      <circle cx="100" cy="100" r={R} fill={`url(#${uid}-ocean)`} />

      <g clipPath={`url(#${uid}-clip)`}>
        {list.map((i) => {
          const baseX = rand(seed + i * 7) * 200;
          const y = 34 + rand(seed + i * 11) * 130;
          const r = 16 + rand(seed + i * 3) * 19;
          // Drawn twice, one planet-width apart, so the wrap has no visible seam.
          return [0, 200].map((wrap) => {
            const x = ((baseX + shift + wrap) % 400) - 100;
            const landD = blobPath(x, y, r, seed + i, 8, 0.55);
            const cid = `${uid}-c${i}-${wrap}`;
            return (
              <g key={`${i}-${wrap}`}>
                {/* The shaded edge is CLIPPED TO THE LANDMASS ITSELF. An offset
                    darker blob drawn loose just looks like a second continent
                    overlapping the first; clipping turns it into an inner shadow
                    hugging the bottom edge, which is what the style actually does. */}
                <clipPath id={cid}>
                  <path d={landD} />
                </clipPath>
                <path d={landD} fill={land} />
                <g clipPath={`url(#${cid})`}>
                  <path
                    d={blobPath(x - r * 0.1, y + r * 0.62, r, seed + i, 8, 0.55)}
                    fill={landShade}
                  />
                </g>
                {detail === "trees"
                  ? [0, 1].map((t) => {
                      const tx = x - r * 0.28 + rand(seed + i * 5 + t) * r * 0.55;
                      const ty = y - r * 0.34 + rand(seed + i * 9 + t) * r * 0.3;
                      return (
                        <g key={t}>
                          <rect x={tx - 1} y={ty} width={2} height={7} fill="#12513A" />
                          <circle cx={tx} cy={ty - 1} r={5.5} fill="#1B7A4F" />
                        </g>
                      );
                    })
                  : null}
              </g>
            );
          });
        })}
      </g>

      <circle
        cx="100"
        cy="100"
        r={R}
        fill={`url(#${uid}-term)`}
        clipPath={`url(#${uid}-clip)`}
      />
      <circle
        cx="100"
        cy="100"
        r={R - 1}
        fill="none"
        stroke={atmosphere}
        strokeWidth="2.5"
        opacity="0.5"
      />
    </svg>
  );
};

/**
 * The recurring inhabitant. Body, belly, wing, tail, tuft, beak, eyes with
 * highlights, feet — a blob with two dots is not enough to carry this style.
 * Kept generic on purpose: emulate the register, don't reproduce a studio's
 * specific character design.
 */
const Bird: React.FC<{
  size: number;
  body: string;
  belly: string;
  seed?: number;
  pose?: "stand" | "wave";
  flip?: boolean;
  frame: number;
}> = ({ size, body, belly, seed = 1, pose = "stand", flip = false, frame }) => {
  const bob = Math.sin(frame / 12 + rand(seed) * 8) * 2.5;
  const wing = pose === "wave" ? Math.sin(frame / 5) * 26 - 20 : Math.sin(frame / 18) * 5;

  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 100 125"
      style={{
        overflow: "visible",
        transform: `translateY(${bob}px) scaleX(${flip ? -1 : 1})`,
      }}
    >
      <path
        d="M40 108 l0 9 M40 117 l-7 5 M40 117 l7 5"
        stroke="#F2A33C"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M62 108 l0 9 M62 117 l-7 5 M62 117 l7 5"
        stroke="#F2A33C"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />

      <path d="M22 80 q-16 8 -19 20 q16 -3 27 -11 Z" fill={body} />
      <path d="M22 80 q-16 8 -19 20 q16 -3 27 -11 Z" fill="#0B1026" opacity={0.2} />

      <ellipse cx="52" cy="66" rx="36" ry="44" fill={body} />
      <ellipse cx="56" cy="78" rx="24" ry="28" fill={belly} opacity={0.9} />

      <g style={{ transform: `rotate(${wing}deg)`, transformOrigin: "44px 60px" }}>
        <ellipse cx="36" cy="74" rx="12" ry="20" fill={body} />
        <ellipse cx="36" cy="74" rx="12" ry="20" fill="#0B1026" opacity={0.18} />
      </g>

      <path d="M52 24 q4 -12 12 -14 q-3 9 -5 14 Z" fill={body} />

      <ellipse cx="42" cy="52" rx="6.5" ry="7.5" fill="#15182B" />
      <circle cx="44" cy="49" r="2.2" fill="#fff" />
      <ellipse cx="66" cy="52" rx="6.5" ry="7.5" fill="#15182B" />
      <circle cx="68" cy="49" r="2.2" fill="#fff" />

      <path d="M54 62 q10 4 0 11 q-6 -5 0 -11 Z" fill="#F2A33C" />
    </svg>
  );
};

/** A stylised tree for ground scenes: trunk plus a stack of rounded blobs. */
const Tree: React.FC<{ size: number; leaf: string; leafShade: string; seed: number }> = ({
  size,
  leaf,
  leafShade,
  seed,
}) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 100 140" style={{ overflow: "visible" }}>
    <rect x="44" y="78" width="12" height="60" rx="6" fill="#5A3B25" />
    <path d={blobPath(50, 58, 40, seed, 9, 0.32)} fill={leaf} />
    <g>
      <clipPath id={`tr${seed}`}>
        <path d={blobPath(50, 58, 40, seed, 9, 0.32)} />
      </clipPath>
      <g clipPath={`url(#tr${seed})`}>
        <path d={blobPath(44, 82, 40, seed, 9, 0.32)} fill={leafShade} />
      </g>
    </g>
  </svg>
);

/* ================================================================== *
 * ATMOSPHERE — the layers that make a frame feel inhabited
 * ================================================================== */

/** Soft light bloom. A radial-gradient div, not a huge box-shadow blur (much cheaper). */
const Glow: React.FC<{ size: number; color: string; opacity?: number }> = ({
  size,
  color,
  opacity = 0.55,
}) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      left: "50%",
      top: "50%",
      marginLeft: -size / 2,
      marginTop: -size / 2,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, ${color}00 68%)`,
      opacity,
      pointerEvents: "none",
    }}
  />
);

const Backdrop: React.FC<{ mood: Mood }> = ({ mood }) => {
  const m = MOODS[mood];
  const horizon = mood === "dawn" || mood === "day";
  return (
    <AbsoluteFill
      style={{
        background: horizon
          ? `linear-gradient(180deg, ${m.outer} 0%, ${m.haze} 58%, ${m.inner} 100%)`
          : `radial-gradient(120% 90% at 50% 32%, ${m.inner} 0%, ${m.outer} 100%)`,
      }}
    />
  );
};

/** Star field with a few 4-point sparkles among the dots, in three parallax tiers. */
const StarField: React.FC<{ count?: number; drift?: number; seed?: number }> = ({
  count = 130,
  drift = 1,
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const items = [];
  for (let i = 0; i < count; i++) {
    const s = i + seed * 1000;
    const depth = 1 + Math.floor(rand(s + 500) * 3);
    const twinkle =
      0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / (14 + depth * 7) + rand(s) * 9));
    const left = `${rand(s * 3.1) * 100}%`;
    const top = `${rand(s * 7.7 + 13) * 100}%`;
    const y = (frame / 30) * depth * drift * -6;
    const sparkle = rand(s + 77) > 0.94;

    if (sparkle) {
      const size = 16 + rand(s + 3) * 10;
      items.push(
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          style={{ position: "absolute", left, top, opacity: twinkle, transform: `translateY(${y}px)` }}
        >
          <path
            d="M10 0 Q11.6 8.4 20 10 Q11.6 11.6 10 20 Q8.4 11.6 0 10 Q8.4 8.4 10 0 Z"
            fill={TEXT}
          />
        </svg>,
      );
    } else {
      const size = depth === 3 ? 4 : depth === 2 ? 3 : 2;
      items.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left,
            top,
            width: size,
            height: size,
            borderRadius: "50%",
            background: TEXT,
            opacity: twinkle * (depth === 1 ? 0.45 : 0.9),
            transform: `translateY(${y}px)`,
          }}
        />,
      );
    }
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

/**
 * Distant planets and drifting debris. This is the density layer — an empty field
 * behind the subject is the most common way this style comes out looking cheap.
 */
const Scenery: React.FC<{ seed: number; frame: number; count?: number }> = ({
  seed,
  frame,
  count = 5,
}) => (
  <AbsoluteFill>
    {Array.from({ length: count }, (_, i) => {
      const s = seed * 31 + i * 17;
      const size = 26 + rand(s) * 74;
      const drift = float(frame, s, 8, 0.4);
      const colors = [VIOLET, TEAL, CORAL, AMBER, MINT];
      const c = colors[Math.floor(rand(s + 5) * colors.length)];
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            // Pushed into the outer thirds and the upper half. Scenery is background
            // texture, so it must not drift behind the subject or any text — a disc
            // sitting under a label reads as a mistake, not as depth.
            left: `${rand(s + 1) > 0.5 ? 74 + rand(s + 3) * 24 : rand(s + 3) * 22 - 6}%`,
            top: `${2 + rand(s + 2) * 44}%`,
            width: size,
            height: size,
            borderRadius: "50%",
            background: `radial-gradient(circle at 34% 30%, ${c} 0%, ${c}99 70%, ${c}44 100%)`,
            // Higher than you would guess: below ~0.2 these desaturate into grey mud
            // against a dark backdrop instead of reading as distant worlds.
            opacity: 0.26 + rand(s + 9) * 0.2,
            transform: `translate(${drift.x}px, ${drift.y}px)`,
            filter: "blur(0.5px)",
          }}
        />
      );
    })}
  </AbsoluteFill>
);

/** Slow god rays from a light source. Very low opacity — they should be felt, not seen. */
const LightRays: React.FC<{ frame: number; color: string; x?: string; y?: string }> = ({
  frame,
  color,
  x = "50%",
  y = "26%",
}) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 2600,
        height: 2600,
        marginLeft: -1300,
        marginTop: -1300,
        transform: `rotate(${frame * 0.06}deg)`,
        background: `repeating-conic-gradient(from 0deg, ${color}1A 0deg 7deg, transparent 7deg 26deg)`,
        // Masked at BOTH ends: without the transparent centre every ray converges on
        // one hard point that reads as a mechanical starburst rather than light. The
        // blur softens the wedge edges for the same reason.
        maskImage:
          "radial-gradient(circle, transparent 0%, rgba(0,0,0,0.9) 20%, transparent 60%)",
        WebkitMaskImage:
          "radial-gradient(circle, transparent 0%, rgba(0,0,0,0.9) 20%, transparent 60%)",
        filter: "blur(22px)",
        opacity: 0.22,
      }}
    />
  </AbsoluteFill>
);

/** Edge darkening. Cheap, and it focuses every frame toward the subject. */
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(115% 78% at 50% 42%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.5) 100%)",
      pointerEvents: "none",
    }}
  />
);

/**
 * Film grain. Static (no frame dependency) so Chromium rasterises the turbulence
 * once instead of every frame — an animated seed here is a large render cost for a
 * texture nobody consciously notices.
 */
const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.045 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
    <svg width="100%" height="100%">
      <filter id="kgGrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" />
      </filter>
      <rect width="100%" height="100%" filter="url(#kgGrain)" />
    </svg>
  </AbsoluteFill>
);

/** Everything that sits on top of every scene, in one place. */
const Finish: React.FC = () => (
  <>
    <Vignette />
    <Grain />
  </>
);

/* ------------------------------------------------------------------ *
 * Text
 * ------------------------------------------------------------------ */

/**
 * Narration caption. Sits in the lower-middle band — low enough to stay clear of the
 * artwork, high enough that a phone's UI chrome never covers it.
 */
const Caption: React.FC<{ children: string; frame: number; delay?: number }> = ({
  children,
  frame,
  delay = 10,
}) => {
  const t = ease(frame, delay, 40);
  return (
    <AbsoluteFill
      style={{
        top: "72%",
        height: "18%",
        // AbsoluteFill is flex-direction: COLUMN. So alignItems controls the
        // HORIZONTAL axis and justifyContent the VERTICAL one — the opposite of the
        // row-flex reflex. Swapping them here left-aligns every caption, which only
        // shows up once a line is short enough not to fill the width.
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "0 90px",
      }}
    >
      <div
        style={{
          opacity: t,
          transform: `translateY(${interpolate(t, [0, 1], [22, 0])}px)`,
          color: TEXT,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 52,
          lineHeight: 1.35,
          textAlign: "center",
          textShadow: "0 4px 24px rgba(0,0,0,0.75)",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Big luminous number — the one place this style raises its voice. */
const BigNumber: React.FC<{ value: string; sub?: string; color: string }> = ({
  value,
  sub,
  color,
}) => (
  <div style={{ textAlign: "center", fontFamily: FONT }}>
    <div
      style={{
        color,
        fontWeight: 800,
        fontSize: 96,
        lineHeight: 1,
        textShadow: `0 0 40px ${color}80`,
      }}
    >
      {value}
    </div>
    {sub ? (
      <div style={{ color: TEXT_DIM, fontSize: 34, marginTop: 10, fontWeight: 500 }}>
        {sub}
      </div>
    ) : null}
  </div>
);

/* ------------------------------------------------------------------ *
 * Scene model
 * ------------------------------------------------------------------ */

type Archetype =
  | "cosmicHero"
  | "crowd"
  | "cutaway"
  | "quantity"
  | "flowMap"
  | "compare";

type Side = { label: string; value: string; weight: number; color: string };

type SceneSpec = {
  id: string;
  caption: string;
  archetype: Archetype;
  durationInFrames: number;
  /** Voiceover under public/ that STARTS on this beat. */
  audio?: string;
  /**
   * How long that voiceover runs, if it outlives this visual beat. Set it when one
   * narration line plays across two or three beats.
   */
  audioFrames?: number;
  mood?: Mood;
  accent?: string;
  label?: string;
  count?: number;
  unitLabel?: string;
  left?: Side;
  right?: Side;
  stops?: string[];
  rings?: { label: string; color: string }[];
};

/**
 * Replace wholesale. Note the pacing: beats are 6-12s, far longer than the
 * mascot-reaction style's 2-4s cuts. The motion inside a beat carries it.
 */
const SCENES: SceneSpec[] = [
  {
    id: "hook",
    archetype: "cosmicHero",
    caption: "Một nắm hạt nhỏ bé từng là ranh giới giữa sự sống và cái chết.",
    durationInFrames: 240,
    mood: "space",
    accent: AMBER,
    label: "một nắm hạt",
  },
  {
    id: "compare",
    archetype: "compare",
    caption: "Lúa nước cần 150 ngày. Giống nhanh nhất chỉ mất 45 ngày.",
    durationInFrames: 240,
    mood: "dusk",
    left: { label: "Lúa nước", value: "150", weight: 150, color: TEAL },
    right: { label: "Kê", value: "45", weight: 45, color: AMBER },
  },
  {
    id: "crowd",
    archetype: "crowd",
    caption: "Người du mục vừa gieo hạt, vừa tiếp tục di chuyển.",
    durationInFrames: 240,
    mood: "dawn",
    accent: MINT,
  },
  {
    id: "quantity",
    archetype: "quantity",
    caption: "Mỗi mùa, một gia đình mang theo hàng ngàn hạt giống.",
    durationInFrames: 210,
    mood: "space",
    accent: SUN,
    count: 84,
    unitLabel: "hạt giống",
  },
  {
    id: "flow",
    archetype: "flowMap",
    caption: "Từ Trung Á, hạt kê lan tới tận Lưỡng Hà.",
    durationInFrames: 270,
    mood: "dusk",
    accent: PINK,
    stops: ["Trung Á", "Cao nguyên Iran", "Lưỡng Hà"],
  },
  {
    id: "close",
    archetype: "cutaway",
    caption: "Một nắm hạt giống đôi khi quý hơn cả thanh kiếm.",
    durationInFrames: 240,
    mood: "space",
    accent: VIOLET,
    rings: [
      { label: "Vỏ trấu", color: VIOLET },
      { label: "Cám", color: CORAL },
      { label: "Phôi", color: SUN },
    ],
  },
];

export const KG_TOTAL_FRAMES = SCENES.reduce((t, s) => t + s.durationInFrames, 0);

/* ================================================================== *
 * ARCHETYPES
 * ================================================================== */

/* --- 1. cosmic hero: a planet, a moon, rays, and a populated field --- */

const SceneCosmicHero: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const accent = scene.accent ?? AMBER;
  const mood = scene.mood ?? "space";
  const push = cameraPush(frame, scene.durationInFrames, 1, 1.12);
  const grow = ease(frame, 6, 46);
  const drift = float(frame, 3, 14);
  const labelT = ease(frame, 28, 34);
  const moonA = (frame * 0.5) / 30;

  return (
    <AbsoluteFill>
      <Backdrop mood={mood} />
      <LightRays frame={frame} color={accent} />
      <Scenery seed={2} frame={frame} count={5} />
      <StarField seed={1} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            top: "-10%",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 460,
              height: 460,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translate(${drift.x}px, ${drift.y}px) scale(${grow})`,
            }}
          >
            <Glow size={860} color={accent} opacity={0.26} />
            <Planet
              size={440}
              ocean={TEAL}
              land={MINT}
              landShade="#1E9E6E"
              atmosphere="#9BE3FF"
              seed={3}
              frame={frame}
            />
            {/* a moon on a visible orbit */}
            <div
              style={{
                position: "absolute",
                // Orbit radius has to exceed the planet's own radius by a clear
                // margin, or the moon spends most of its orbit glued to the limb.
                left: 230 + Math.cos(moonA) * 310 - 42,
                top: 230 + Math.sin(moonA) * 112 - 42,
                zIndex: Math.sin(moonA) > 0 ? 2 : 0,
              }}
            >
              <Planet
                size={84}
                ocean="#C9D2E8"
                land="#9AA6C4"
                landShade="#7C88A8"
                atmosphere="#E3ECFF"
                seed={12}
                detail="none"
                continents={3}
                spin={0.03}
                frame={frame}
              />
            </div>
          </div>
          {scene.label ? (
            <div
              style={{
                marginTop: 60,
                opacity: labelT,
                fontFamily: FONT,
                fontSize: 38,
                fontWeight: 600,
                color: TEXT_DIM,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {scene.label}
            </div>
          ) : null}
        </AbsoluteFill>
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
      <Finish />
    </AbsoluteFill>
  );
};

/* --- 2. crowd: a landscape, not a bare curve --- */

const CROWD_SIZE = 7;
const CROWD = Array.from({ length: CROWD_SIZE }, (_, i) => i);
const HILL_TREES = Array.from({ length: 9 }, (_, i) => i);

const SceneCrowd: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const accent = scene.accent ?? MINT;
  const mood = scene.mood ?? "dawn";
  const push = cameraPush(frame, scene.durationInFrames, 1.04, 1);
  const bodies = [TEAL, VIOLET, CORAL, SUN, MINT, PINK, AMBER];

  return (
    <AbsoluteFill>
      <Backdrop mood={mood} />
      <LightRays frame={frame} color="#FFD9A0" y="18%" />
      {/* distant hills, two parallax layers behind the ground */}
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <svg
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <path
            d="M-40 940 q160 -130 330 -40 q150 80 300 -20 q170 -110 340 10 q90 60 190 20 l0 1040 l-1160 0 Z"
            fill="#2D2350"
            opacity={0.75}
          />
          <path
            d="M-40 1060 q220 -120 430 -20 q190 90 380 -30 q160 -100 350 30 l0 940 l-1160 0 Z"
            fill="#231C42"
          />
        </svg>
        {/* ground */}
        <div
          style={{
            position: "absolute",
            width: 2600,
            height: 2600,
            left: "50%",
            marginLeft: -1300,
            // The ground sits high enough that the birds standing on it finish well
            // above the caption band. At 70% they landed right on top of the text.
            top: "56%",
            borderRadius: "50%",
            // Stops bunched near 0%: the circle is 2600px tall but only its top
            // ~800px is on screen, so gentle stops leave the whole lower frame
            // bright and white captions stop being readable.
            background: `linear-gradient(180deg, ${accent} 0%, #14603F 5%, #0C2E24 11%, #060B12 19%)`,
          }}
        />
        {/* trees along the ridge */}
        {HILL_TREES.map((i) => {
          const x = (i / HILL_TREES.length) * 112 - 6 + rand(i * 3) * 5;
          const dip = Math.abs(x - 50) / 50;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${56.5 + dip * 3.2}%`,
                opacity: ease(frame, 4 + i * 2, 30),
              }}
            >
              <Tree size={74 + rand(i) * 40} leaf="#1E9E6E" leafShade="#146B4B" seed={i + 4} />
            </div>
          );
        })}
        {/* the flock, walking */}
        {CROWD.map((i) => {
          const t = ease(frame, 8 + i * 4, 30);
          // Evenly spaced with a small jitter: purely random x clumps two or three
          // birds into one overlapping pile most of the time.
          const baseX = (i / CROWD_SIZE) * 118 + rand(i * 5) * 5;
          const x = ((baseX + (frame / 30) * 1.8) % 118) - 9;
          const dip = Math.abs(x - 50) / 50;
          const size = 120 + rand(i + 3) * 46;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${57 + dip * 3.4}%`,
                opacity: t,
                transform: `scale(${interpolate(t, [0, 1], [0.7, 1])})`,
              }}
            >
              <Bird
                size={size}
                body={bodies[i % bodies.length]}
                belly="#F4F7FF"
                seed={i}
                pose={i === 3 ? "wave" : "stand"}
                frame={frame}
              />
            </div>
          );
        })}
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
      <Finish />
    </AbsoluteFill>
  );
};

/* --- 3. cutaway rings --- */

const SceneCutaway: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const rings = scene.rings ?? [];
  const mood = scene.mood ?? "space";
  const accent = scene.accent ?? VIOLET;
  const push = cameraPush(frame, scene.durationInFrames, 1, 1.06);
  const drift = float(frame, 21, 10);

  return (
    <AbsoluteFill>
      <Backdrop mood={mood} />
      <LightRays frame={frame} color={accent} />
      <Scenery seed={7} frame={frame} count={4} />
      <StarField count={90} seed={4} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            top: "-12%",
            flexDirection: "column",
            gap: 56,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 620,
              height: 620,
              transform: `translate(${drift.x}px, ${drift.y}px)`,
            }}
          >
            <Glow size={820} color={accent} opacity={0.22} />
            {rings.map((ring, i) => {
              const outer = 560 - i * 150;
              const t = ease(frame, 10 + i * 12, 40);
              return (
                <div
                  key={ring.label}
                  style={{
                    position: "absolute",
                    width: outer,
                    height: outer,
                    left: 310 - outer / 2,
                    top: 310 - outer / 2,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 34% 28%, ${ring.color} 0%, ${ring.color}D9 68%, ${ring.color}8C 100%)`,
                    opacity: t,
                    transform: `scale(${interpolate(t, [0, 1], [0.86, 1])})`,
                  }}
                />
              );
            })}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `rotate(${frame * 0.15}deg)`,
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 4,
                    height: 22,
                    left: 308,
                    top: 8,
                    background: `${TEXT}55`,
                    transformOrigin: "2px 302px",
                    transform: `rotate(${i * 45}deg)`,
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 34 }}>
            {rings.map((ring, i) => (
              <div
                key={ring.label}
                style={{
                  opacity: ease(frame, 20 + i * 12, 34),
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontFamily: FONT,
                  fontSize: 30,
                  color: TEXT_DIM,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: ring.color,
                    display: "inline-block",
                  }}
                />
                {ring.label}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
      <Finish />
    </AbsoluteFill>
  );
};

/* --- 4. quantity field, with a bird carrying one --- */

const SceneQuantity: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const accent = scene.accent ?? SUN;
  const mood = scene.mood ?? "space";
  const count = scene.count ?? 60;
  const push = cameraPush(frame, scene.durationInFrames, 1.05, 1);
  const perRow = 12;
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <AbsoluteFill>
      <Backdrop mood={mood} />
      <Scenery seed={11} frame={frame} count={4} />
      <StarField count={70} drift={0.4} seed={6} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            top: "-8%",
            flexDirection: "column",
            gap: 44,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${perRow}, 1fr)`,
              gap: 20,
              width: 760,
            }}
          >
            {items.map((i) => {
              const t = ease(frame, 4 + i * 1.1, 22);
              const wob = Math.sin(i * 1.7 + frame / 40) * 5;
              return (
                <div
                  key={i}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50% 50% 50% 14%",
                    background: `radial-gradient(circle at 35% 30%, ${
                      i % 7 === 0 ? CORAL : accent
                    } 0%, ${i % 7 === 0 ? "#D93A3F" : "#E09A22"} 100%)`,
                    opacity: t,
                    transform: `scale(${interpolate(t, [0, 1], [0.2, 1])}) rotate(${wob}deg)`,
                    boxShadow: `0 0 16px ${accent}55`,
                  }}
                />
              );
            })}
          </div>
          {/* a bird holding one of them, so the quantity has a scale reference */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
            <Bird size={150} body={TEAL} belly="#DFF6FF" seed={31} pose="wave" frame={frame} />
            {scene.unitLabel ? (
              <BigNumber value={String(count)} sub={scene.unitLabel} color={accent} />
            ) : null}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
      <Finish />
    </AbsoluteFill>
  );
};

/* --- 5. flow map --- */

const SceneFlowMap: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const accent = scene.accent ?? PINK;
  const mood = scene.mood ?? "dusk";
  const stops = scene.stops ?? [];
  const push = cameraPush(frame, scene.durationInFrames, 1, 1.05);

  const draw = ease(frame, 8, 80);
  const travel = interpolate(frame, [30, scene.durationInFrames - 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Path and traveller are driven by the same maths so they cannot drift apart.
  const n = Math.max(1, stops.length - 1);
  const nodeX = (i: number) => 150 + (i * 780) / n;
  const nodeY = (i: number) => (i % 2 === 0 ? 330 : 170);

  const seg = Math.min(n - 1, Math.floor(travel * n));
  const local = travel * n - seg;
  const travX = nodeX(seg) + (nodeX(seg + 1) - nodeX(seg)) * local;
  const travY =
    nodeY(seg) + (nodeY(seg + 1) - nodeY(seg)) * local - Math.sin(local * Math.PI) * 60;

  let pathD = `M ${nodeX(0)} ${nodeY(0)}`;
  for (let i = 0; i < n; i++) {
    const cx = (nodeX(i) + nodeX(i + 1)) / 2;
    pathD += ` Q ${cx} ${Math.min(nodeY(i), nodeY(i + 1)) - 70}, ${nodeX(i + 1)} ${nodeY(i + 1)}`;
  }

  return (
    <AbsoluteFill>
      <Backdrop mood={mood} />
      <LightRays frame={frame} color={accent} />
      <Scenery seed={19} frame={frame} count={4} />
      <StarField count={80} seed={8} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill style={{ top: "16%", height: "42%" }}>
          <svg viewBox="0 0 1080 500" style={{ width: "100%", height: "100%" }}>
            <defs>
              <linearGradient id="kgFlowGrad" x1="0" x2="1">
                <stop offset="0%" stopColor={TEAL} />
                <stop offset="100%" stopColor={accent} />
              </linearGradient>
              <radialGradient id="kgTravellerGlow">
                <stop offset="0%" stopColor={SUN} stopOpacity={0.55} />
                <stop offset="100%" stopColor={SUN} stopOpacity={0} />
              </radialGradient>
            </defs>
            <path
              d={pathD}
              fill="none"
              stroke="url(#kgFlowGrad)"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={2400}
              strokeDashoffset={2400 * (1 - draw)}
            />
            {stops.map((stop, i) => {
              const lit = travel >= i / n - 0.02;
              return (
                <g key={stop}>
                  <circle
                    cx={nodeX(i)}
                    cy={nodeY(i)}
                    r={lit ? 26 : 18}
                    fill={lit ? accent : `${TEXT}33`}
                  />
                  <text
                    x={nodeX(i)}
                    y={nodeY(i) - 48}
                    // The first and last labels are wide enough to run off the
                    // canvas if they stay centred on their node.
                    textAnchor={i === 0 ? "start" : i === stops.length - 1 ? "end" : "middle"}
                    fill={lit ? TEXT : TEXT_DIM}
                    fontSize={32}
                    fontFamily={FONT}
                    fontWeight={600}
                  >
                    {stop}
                  </text>
                </g>
              );
            })}
            {/* Halo is a radial gradient: a flat translucent circle over a dark
                backdrop just reads as a grey smudge. */}
            <circle cx={travX} cy={travY} r={40} fill="url(#kgTravellerGlow)" />
            <circle cx={travX} cy={travY} r={17} fill={SUN} />
          </svg>
        </AbsoluteFill>
        {/* a traveller carrying the cargo, under the route */}
        <AbsoluteFill style={{ top: "52%", alignItems: "center" }}>
          <div style={{ opacity: ease(frame, 30, 40) }}>
            <Bird size={190} body={AMBER} belly="#FFF0D0" seed={44} frame={frame} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
      <Finish />
    </AbsoluteFill>
  );
};

/* --- 6. comparison, as two planets --- */

const SceneCompare: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const mood = scene.mood ?? "dusk";
  const push = cameraPush(frame, scene.durationInFrames, 1, 1.05);

  const sides: { side: Side; delay: number; seed: number }[] = [];
  if (scene.left) sides.push({ side: scene.left, delay: 8, seed: 41 });
  if (scene.right) sides.push({ side: scene.right, delay: 22, seed: 77 });

  const maxWeight = Math.max(1, ...sides.map((s) => s.side.weight));
  const sizeFor = (w: number) => 170 + (w / maxWeight) * 250;
  // Every disc gets a box as tall as the LARGEST disc. Without this the shorter
  // column is shorter overall, and its number and label sit at a different height
  // from its neighbour's — which reads as a bug rather than as a comparison.
  const boxSize = sizeFor(maxWeight);

  return (
    <AbsoluteFill>
      <Backdrop mood={mood} />
      <Scenery seed={23} frame={frame} count={4} />
      <StarField count={80} seed={9} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill
          style={{
            // One flex row with a fixed gap: the two sides centre as a unit, so they
            // can never collide on one edge while leaving the other side empty.
            flexDirection: "row",
            // Keep this "center". In a ROW container alignItems is the vertical
            // axis, so "flex-end" here does not baseline-align the two sides — it
            // drops the whole group onto the bottom of the frame, on top of the
            // caption. Number alignment is handled by the equal-height boxes above.
            alignItems: "center",
            justifyContent: "center",
            top: "-10%",
            gap: 70,
          }}
        >
          {sides.map(({ side, delay, seed }) => {
            const t = ease(frame, delay, 40);
            const drift = float(frame, seed, 10);
            const size = sizeFor(side.weight);
            return (
              <div
                key={side.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 24,
                  opacity: t,
                  transform: `translate(${drift.x}px, ${drift.y}px) scale(${interpolate(
                    t,
                    [0, 1],
                    [0.82, 1],
                  )})`,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: boxSize,
                    height: boxSize,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Glow size={size * 2} color={side.color} opacity={0.3} />
                  <Planet
                    size={size}
                    ocean={side.color}
                    land={side.color === TEAL ? MINT : "#FF7A45"}
                    landShade={side.color === TEAL ? "#1E9E6E" : "#D9542E"}
                    atmosphere={side.color === TEAL ? "#9BE3FF" : "#FFD79A"}
                    seed={seed}
                    continents={4}
                    detail={side.color === TEAL ? "trees" : "none"}
                    frame={frame}
                  />
                </div>
                <BigNumber value={side.value} sub={side.label} color={side.color} />
              </div>
            );
          })}
        </AbsoluteFill>
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
      <Finish />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * Crossfade wrapper
 * ------------------------------------------------------------------ */

/**
 * True crossfade, not two fades to black. Each beat's <Sequence> starts FADE frames
 * EARLY, overlapping the previous beat's still-opaque tail, and only fades IN.
 * Later beats paint over earlier ones in JSX order, so the outgoing beat is simply
 * covered and never exposes black canvas. Only the final beat also fades out.
 */
const Reveal: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  isFirst: boolean;
  isLast: boolean;
}> = ({ children, durationInFrames, isFirst, isLast }) => {
  const frame = useCurrentFrame();

  const fadeIn = isFirst
    ? 1
    : interpolate(frame, [0, FADE], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  const fadeOut = isLast
    ? interpolate(frame, [durationInFrames - FADE, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>{children}</AbsoluteFill>;
};

/* ------------------------------------------------------------------ *
 * Dispatch + root
 * ------------------------------------------------------------------ */

const SceneBody: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  switch (scene.archetype) {
    case "cosmicHero":
      return <SceneCosmicHero scene={scene} />;
    case "crowd":
      return <SceneCrowd scene={scene} />;
    case "cutaway":
      return <SceneCutaway scene={scene} />;
    case "quantity":
      return <SceneQuantity scene={scene} />;
    case "flowMap":
      return <SceneFlowMap scene={scene} />;
    case "compare":
      return <SceneCompare scene={scene} />;
  }
};

export const KgExample: React.FC = () => {
  let acc = 0;
  const starts = SCENES.map((s) => {
    const start = acc;
    acc += s.durationInFrames;
    return start;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: MOODS.space.outer }}>
      {SCENES.map((scene, i) => {
        const isFirst = i === 0;
        const isLast = i === SCENES.length - 1;
        const from = isFirst ? starts[i] : starts[i] - FADE;
        const durationInFrames = isFirst
          ? scene.durationInFrames
          : scene.durationInFrames + FADE;

        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
            <Reveal
              durationInFrames={durationInFrames}
              isFirst={isFirst}
              isLast={isLast}
            >
              <SceneBody scene={scene} />
            </Reveal>
          </Sequence>
        );
      })}

      {/*
        Narration lives at the ROOT, never inside a beat's <Sequence>. A Sequence
        clips its children, so nesting the voiceover inside a visual beat cuts the
        narration off the instant the visuals change. Keeping them separate is what
        lets one narration line play across two or three beats.
      */}
      {SCENES.map((scene, i) =>
        scene.audio ? (
          <Sequence
            key={`audio-${scene.id}`}
            from={starts[i]}
            durationInFrames={scene.audioFrames ?? scene.durationInFrames}
          >
            <Audio src={staticFile(scene.audio)} />
          </Sequence>
        ) : null,
      )}
    </AbsoluteFill>
  );
};
