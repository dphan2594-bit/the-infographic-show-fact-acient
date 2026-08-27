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
 * Everything is drawn with SVG + CSS. There are NO image or video assets.
 *
 * THE FLAT RULE — read this before adding anything.
 * This style is bold flat colour blocking: every shape holds ONE saturated hue with a
 * sharp boundary. Gradients are rare and deliberate (a sky, and nothing else); soft
 * glows, blurs, grain and vignettes are NOT part of it — they round off the very
 * edges the style depends on and desaturate the palette. Depth comes from stacking
 * flat shapes in contrasting hues, not from tonal shading.
 *
 * Three layers, worth keeping separate in your head:
 *   ILLUSTRATION KIT  — Planet, Bird, Tree: the things being drawn.
 *   COMPOSITION       — colour fields, rings, rays, starfield, scenery.
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
 * Palette — maximum chroma, warm against cool
 * ------------------------------------------------------------------ */

/*
 * Every colour here is near-full saturation. The tension in a frame comes from
 * putting a hot hue hard against a cool one with no transition between them, so
 * avoid muted or greyed variants entirely — a desaturated colour in this palette
 * reads as a mistake, not as subtlety.
 */

const NIGHT = "#141C7A"; // saturated indigo field
const NIGHT_DEEP = "#0C1257";
const ROYAL = "#2340E8";
const VIOLET = "#7B2DFF";
const PURPLE_DEEP = "#3B10A8";

const CYAN = "#00D4FF";
const TEAL = "#00C2A0";
const LIME = "#9BE800";

const AMBER = "#FFC000";
const ORANGE = "#FF7A00";
const CORAL = "#FF3355";
const MAGENTA = "#FF2D95";

const CREAM = "#FFF3D6";
const TEXT = "#FFFFFF";

/**
 * No webfont is bundled, so this resolves to whatever sans-serif the render machine
 * has. Vietnamese diacritics come out correctly on the usual fallbacks, but the
 * letterforms are NOT pinned across machines — add a real font and put it first here
 * if the look needs to be reproducible.
 */
const FONT = "'Inter', system-ui, sans-serif";

/**
 * Backdrops. `field` is a flat colour covering the frame; `accent` is one big flat
 * disc behind the subject, which is how this style gets depth without gradients.
 * `dawn` is the one place a gradient is allowed — a sky reads as a sky.
 */
const MOODS = {
  space: { field: NIGHT, accent: ROYAL, ring: CYAN },
  dusk: { field: PURPLE_DEEP, accent: VIOLET, ring: MAGENTA },
  dawn: { field: CORAL, accent: ORANGE, ring: AMBER },
  day: { field: "#0093E8", accent: CYAN, ring: LIME },
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

/** Smooth closed organic blob through seeded polar points. Continents, hills, foliage. */
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
 * A planet, not a circle — but built entirely from flat blocks.
 *
 * Ocean is ONE solid hue. Continents are one solid hue each, with a second solid
 * shade clipped inside them. The night side is a hard-edged crescent made by an
 * offset circle, not a radial gradient — a gradient would smear the terminator into
 * a tonal ramp and break the flat rule. Atmosphere is a crisp stroked ring.
 * Continents drift and wrap, which reads as rotation.
 */
const Planet: React.FC<{
  size: number;
  ocean: string;
  land: string;
  landShade: string;
  night: string;
  ring: string;
  seed?: number;
  spin?: number;
  continents?: number;
  frame: number;
}> = ({
  size,
  ocean,
  land,
  landShade,
  night,
  ring,
  seed = 1,
  spin = 0.06,
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
        <clipPath id={`${uid}-clip`}>
          <circle cx="100" cy="100" r={R} />
        </clipPath>
        {/* the lit side, used to cut a hard crescent out of the night block */}
        <mask id={`${uid}-night`}>
          <rect x="0" y="0" width="200" height="200" fill="#fff" />
          <circle cx="72" cy="88" r={R} fill="#000" />
        </mask>
      </defs>

      {/* body: one flat hue */}
      <circle cx="100" cy="100" r={R} fill={ocean} />

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
                {/* The shaded block is CLIPPED TO THE LANDMASS ITSELF. An offset
                    darker blob drawn loose just looks like a second continent
                    overlapping the first. */}
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
              </g>
            );
          });
        })}

        {/* night side: one flat block with a hard crescent edge */}
        <circle cx="100" cy="100" r={R} fill={night} mask={`url(#${uid}-night)`} />
      </g>

      {/* atmosphere: a crisp ring, not a soft halo */}
      <circle cx="100" cy="100" r={R + 7} fill="none" stroke={ring} strokeWidth="5" />
    </svg>
  );
};

/**
 * The recurring inhabitant. Every part is one flat colour with a sharp edge: body,
 * belly, wing, tail, tuft, beak, eyes with highlights, feet.
 */
const Bird: React.FC<{
  size: number;
  body: string;
  belly: string;
  wing: string;
  seed?: number;
  pose?: "stand" | "wave";
  flip?: boolean;
  frame: number;
}> = ({ size, body, belly, wing, seed = 1, pose = "stand", flip = false, frame }) => {
  const bob = Math.sin(frame / 12 + rand(seed) * 8) * 2.5;
  const wingAngle =
    pose === "wave" ? Math.sin(frame / 5) * 26 - 20 : Math.sin(frame / 18) * 5;

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
        stroke={ORANGE}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M62 108 l0 9 M62 117 l-7 5 M62 117 l7 5"
        stroke={ORANGE}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />

      <path d="M22 80 q-16 8 -19 20 q16 -3 27 -11 Z" fill={wing} />

      <ellipse cx="52" cy="66" rx="36" ry="44" fill={body} />
      <ellipse cx="56" cy="78" rx="24" ry="28" fill={belly} />

      <g style={{ transform: `rotate(${wingAngle}deg)`, transformOrigin: "44px 60px" }}>
        <ellipse cx="36" cy="74" rx="12" ry="20" fill={wing} />
      </g>

      <path d="M52 24 q4 -12 12 -14 q-3 9 -5 14 Z" fill={body} />

      <ellipse cx="42" cy="52" rx="6.5" ry="7.5" fill={NIGHT_DEEP} />
      <circle cx="44" cy="49" r="2.2" fill={TEXT} />
      <ellipse cx="66" cy="52" rx="6.5" ry="7.5" fill={NIGHT_DEEP} />
      <circle cx="68" cy="49" r="2.2" fill={TEXT} />

      <path d="M54 62 q10 4 0 11 q-6 -5 0 -11 Z" fill={AMBER} />
    </svg>
  );
};

/** Trunk plus a leaf blob with one flat shade block clipped inside it. */
const Tree: React.FC<{ size: number; leaf: string; leafShade: string; seed: number }> = ({
  size,
  leaf,
  leafShade,
  seed,
}) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 100 140" style={{ overflow: "visible" }}>
    <rect x="44" y="78" width="12" height="60" rx="6" fill={ORANGE} />
    <path d={blobPath(50, 58, 40, seed, 9, 0.32)} fill={leaf} />
    <clipPath id={`tr${seed}`}>
      <path d={blobPath(50, 58, 40, seed, 9, 0.32)} />
    </clipPath>
    <g clipPath={`url(#tr${seed})`}>
      <path d={blobPath(44, 84, 40, seed, 9, 0.32)} fill={leafShade} />
    </g>
  </svg>
);

/* ================================================================== *
 * COMPOSITION LAYERS
 * ================================================================== */

/**
 * Depth without gradients: a flat colour field, one big flat accent disc behind the
 * subject, and a crisp ring around it. This replaces the soft radial backdrop and
 * the blurred glow — both of which desaturated the frame and softened its edges.
 */
const Field: React.FC<{ mood: Mood; discScale?: number }> = ({ mood, discScale = 1 }) => {
  const m = MOODS[mood];
  const sky = mood === "dawn";
  return (
    <AbsoluteFill style={{ backgroundColor: m.field }}>
      {sky ? (
        // The one sanctioned gradient in this style: a sky. Saturated stops the whole
        // way down, with no muted midpoint.
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${PURPLE_DEEP} 0%, ${MAGENTA} 34%, ${CORAL} 62%, ${AMBER} 100%)`,
          }}
        />
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              width: 1160 * discScale,
              height: 1160 * discScale,
              left: "50%",
              top: "34%",
              marginLeft: (-1160 * discScale) / 2,
              marginTop: (-1160 * discScale) / 2,
              borderRadius: "50%",
              backgroundColor: m.accent,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 1320 * discScale,
              height: 1320 * discScale,
              left: "50%",
              top: "34%",
              marginLeft: (-1320 * discScale) / 2,
              marginTop: (-1320 * discScale) / 2,
              borderRadius: "50%",
              border: `6px solid ${m.ring}`,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};

/**
 * Flat concentric rings. Replaces the blurred glow — same emphasis, sharp edges.
 *
 * Drawn at FULL opacity. Fading a colour with `opacity` over a contrasting field is
 * how you get mud: a warm ring at 45% over violet mixes to olive. If a ring is too
 * loud, pick a quieter flat hue — never dial down the alpha.
 */
const Rings: React.FC<{ size: number; color: string; count?: number }> = ({
  size,
  color,
  count = 2,
}) => (
  <>
    {Array.from({ length: count }, (_, i) => {
      const d = size + i * size * 0.22;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            width: d,
            height: d,
            left: "50%",
            top: "50%",
            marginLeft: -d / 2,
            marginTop: -d / 2,
            borderRadius: "50%",
            border: `${5 - i}px solid ${color}`,
            pointerEvents: "none",
          }}
        />
      );
    })}
  </>
);

/** Star field: solid dots and 4-point sparkles, three parallax tiers. */
const StarField: React.FC<{ count?: number; drift?: number; seed?: number }> = ({
  count = 120,
  drift = 1,
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const items = [];
  for (let i = 0; i < count; i++) {
    const s = i + seed * 1000;
    const depth = 1 + Math.floor(rand(s + 500) * 3);
    const left = `${rand(s * 3.1) * 100}%`;
    const top = `${rand(s * 7.7 + 13) * 100}%`;
    const y = (frame / 30) * depth * drift * -6;
    // Twinkle STEPS between two flat opacities rather than fading continuously — a
    // smooth ramp is tonal variation, which this style avoids.
    const on = Math.sin(frame / (14 + depth * 7) + rand(s) * 9) > -0.3;
    const sparkle = rand(s + 77) > 0.93;

    if (sparkle) {
      const size = 18 + rand(s + 3) * 12;
      items.push(
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          style={{
            position: "absolute",
            left,
            top,
            opacity: on ? 1 : 0.45,
            transform: `translateY(${y}px)`,
          }}
        >
          <path
            d="M10 0 Q11.6 8.4 20 10 Q11.6 11.6 10 20 Q8.4 11.6 0 10 Q8.4 8.4 10 0 Z"
            fill={CREAM}
          />
        </svg>,
      );
    } else {
      const size = depth === 3 ? 5 : depth === 2 ? 4 : 3;
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
            backgroundColor: CREAM,
            opacity: on ? 0.95 : 0.5,
            transform: `translateY(${y}px)`,
          }}
        />,
      );
    }
  }
  return <AbsoluteFill>{items}</AbsoluteFill>;
};

/**
 * Distant worlds. Solid fills at full opacity — the earlier translucent version
 * desaturated into grey smudges, which is exactly what this palette must not do.
 * Kept to the outer thirds and upper half so nothing sits behind subject or text.
 */
const Scenery: React.FC<{ seed: number; frame: number; count?: number }> = ({
  seed,
  frame,
  count = 5,
}) => {
  const colors = [VIOLET, CYAN, CORAL, AMBER, MAGENTA, LIME];
  return (
    <AbsoluteFill>
      {Array.from({ length: count }, (_, i) => {
        const s = seed * 31 + i * 17;
        const size = 30 + rand(s) * 70;
        const drift = float(frame, s, 8, 0.4);
        const c = colors[Math.floor(rand(s + 5) * colors.length)];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${rand(s + 1) > 0.5 ? 74 + rand(s + 3) * 24 : rand(s + 3) * 22 - 6}%`,
              top: `${2 + rand(s + 2) * 44}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: c,
              transform: `translate(${drift.x}px, ${drift.y}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Hard-edged light wedges. The blurred conic-gradient version broke the flat rule;
 * these are solid triangles at low opacity, so the boundaries stay sharp.
 *
 * Pick the colour from the SAME hue family as the field behind it. A warm ray at low
 * opacity over a cool field mixes to grey and drops a band of mud across the frame —
 * the one thing this palette must never do. Warm rays belong over a warm sky.
 */
const Rays: React.FC<{ frame: number; color: string; count?: number }> = ({
  frame,
  color,
  count = 12,
}) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <svg
      viewBox="-100 -100 200 200"
      style={{
        position: "absolute",
        width: "260%",
        height: "260%",
        left: "-80%",
        top: "-95%",
        transform: `rotate(${frame * 0.05}deg)`,
        opacity: 0.16,
      }}
    >
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * 360;
        return (
          <path
            key={i}
            d="M0 0 L -4 -140 L 4 -140 Z"
            fill={color}
            transform={`rotate(${a})`}
          />
        );
      })}
    </svg>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ *
 * Text
 * ------------------------------------------------------------------ */

/**
 * Narration caption. Sits in the lower-middle band — low enough to stay clear of the
 * artwork, high enough that a phone's UI chrome never covers it.
 *
 * The shadow is a HARD offset, not a blur: a soft drop shadow is tonal haze and
 * fights the flat rule. Legibility over a busy frame comes from the offset block.
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
          fontWeight: 800,
          fontSize: 52,
          lineHeight: 1.35,
          textAlign: "center",
          textShadow: `4px 5px 0 ${NIGHT_DEEP}`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Big number — the one place this style raises its voice. Flat, with a hard shadow. */
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
        fontSize: 104,
        lineHeight: 1,
        textShadow: `5px 6px 0 ${NIGHT_DEEP}`,
      }}
    >
      {value}
    </div>
    {sub ? (
      <div
        style={{
          color: TEXT,
          fontSize: 34,
          marginTop: 10,
          fontWeight: 700,
          textShadow: `3px 3px 0 ${NIGHT_DEEP}`,
        }}
      >
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
    left: { label: "Lúa nước", value: "150", weight: 150, color: CYAN },
    right: { label: "Kê", value: "45", weight: 45, color: AMBER },
  },
  {
    id: "crowd",
    archetype: "crowd",
    caption: "Người du mục vừa gieo hạt, vừa tiếp tục di chuyển.",
    durationInFrames: 240,
    mood: "dawn",
    accent: LIME,
  },
  {
    id: "quantity",
    archetype: "quantity",
    caption: "Mỗi mùa, một gia đình mang theo hàng ngàn hạt giống.",
    durationInFrames: 210,
    mood: "space",
    accent: AMBER,
    count: 84,
    unitLabel: "hạt giống",
  },
  {
    id: "flow",
    archetype: "flowMap",
    caption: "Từ Trung Á, hạt kê lan tới tận Lưỡng Hà.",
    durationInFrames: 270,
    mood: "dusk",
    accent: MAGENTA,
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
      { label: "Phôi", color: AMBER },
    ],
  },
];

export const KG_TOTAL_FRAMES = SCENES.reduce((t, s) => t + s.durationInFrames, 0);

/* ================================================================== *
 * ARCHETYPES
 * ================================================================== */

/* --- 1. cosmic hero --- */

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
      <Field mood={mood} />
      <Rays frame={frame} color={MOODS[mood].ring} />
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
            <Rings size={560} color={CYAN} />
            <Planet
              size={440}
              ocean={CYAN}
              land={LIME}
              landShade={TEAL}
              night={ROYAL}
              ring={CREAM}
              seed={3}
              frame={frame}
            />
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
                ocean={MAGENTA}
                land={CORAL}
                landShade={VIOLET}
                night={PURPLE_DEEP}
                ring={CREAM}
                seed={12}
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
                fontWeight: 800,
                color: accent,
                letterSpacing: 3,
                textTransform: "uppercase",
                textShadow: `3px 4px 0 ${NIGHT_DEEP}`,
              }}
            >
              {scene.label}
            </div>
          ) : null}
        </AbsoluteFill>
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
    </AbsoluteFill>
  );
};

/* --- 2. crowd: a flat-blocked landscape --- */

const CROWD_SIZE = 7;
const CROWD = Array.from({ length: CROWD_SIZE }, (_, i) => i);
const HILL_TREES = Array.from({ length: 9 }, (_, i) => i);

const SceneCrowd: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const accent = scene.accent ?? LIME;
  const mood = scene.mood ?? "dawn";
  const push = cameraPush(frame, scene.durationInFrames, 1.04, 1);
  const bodies = [CYAN, VIOLET, CORAL, AMBER, TEAL, MAGENTA, ORANGE];

  return (
    <AbsoluteFill>
      <Field mood={mood} />
      {/* a flat sun disc, hard edged */}
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          left: "50%",
          marginLeft: -210,
          top: "24%",
          borderRadius: "50%",
          backgroundColor: AMBER,
        }}
      />
      <Rays frame={frame} color={AMBER} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {/* two parallax hill ranges, each one flat saturated hue */}
        <svg
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <path
            d="M-40 940 q160 -130 330 -40 q150 80 300 -20 q170 -110 340 10 q90 60 190 20 l0 1040 l-1160 0 Z"
            fill={VIOLET}
          />
          <path
            d="M-40 1060 q220 -120 430 -20 q190 90 380 -30 q160 -100 350 30 l0 940 l-1160 0 Z"
            fill={PURPLE_DEEP}
          />
        </svg>
        {/* ground: two flat bands, no gradient. It sits high enough that the birds
            standing on it finish well above the caption band. */}
        <div
          style={{
            position: "absolute",
            width: 2600,
            height: 2600,
            left: "50%",
            marginLeft: -1300,
            top: "56%",
            borderRadius: "50%",
            backgroundColor: accent,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 2600,
            height: 2600,
            left: "50%",
            marginLeft: -1300,
            top: "63%",
            borderRadius: "50%",
            backgroundColor: TEAL,
          }}
        />
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
              <Tree size={74 + rand(i) * 40} leaf={TEAL} leafShade={ROYAL} seed={i + 4} />
            </div>
          );
        })}
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
                belly={CREAM}
                wing={ROYAL}
                seed={i}
                pose={i === 3 ? "wave" : "stand"}
                frame={frame}
              />
            </div>
          );
        })}
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
    </AbsoluteFill>
  );
};

/* --- 3. cutaway rings --- */

const SceneCutaway: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const rings = scene.rings ?? [];
  const mood = scene.mood ?? "space";
  const push = cameraPush(frame, scene.durationInFrames, 1, 1.06);
  const drift = float(frame, 21, 10);

  return (
    <AbsoluteFill>
      <Field mood={mood} />
      <Rays frame={frame} color={MOODS[mood].ring} />
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
                    backgroundColor: ring.color,
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
                    width: 6,
                    height: 26,
                    left: 307,
                    top: 4,
                    backgroundColor: CREAM,
                    transformOrigin: "3px 306px",
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
                  fontWeight: 700,
                  color: TEXT,
                  textShadow: `3px 3px 0 ${NIGHT_DEEP}`,
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: ring.color,
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
    </AbsoluteFill>
  );
};

/* --- 4. quantity field --- */

const SceneQuantity: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const accent = scene.accent ?? AMBER;
  const mood = scene.mood ?? "space";
  const count = scene.count ?? 60;
  const push = cameraPush(frame, scene.durationInFrames, 1.05, 1);
  const perRow = 12;
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <AbsoluteFill>
      <Field mood={mood} />
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
                    backgroundColor: i % 7 === 0 ? CORAL : accent,
                    opacity: t,
                    transform: `scale(${interpolate(t, [0, 1], [0.2, 1])}) rotate(${wob}deg)`,
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
            <Bird
              size={150}
              body={CYAN}
              belly={CREAM}
              wing={ROYAL}
              seed={31}
              pose="wave"
              frame={frame}
            />
            {/* Only label the field when the count means something the narration
                actually claims — a big number nobody said is a fabricated statistic. */}
            {scene.unitLabel ? (
              <BigNumber value={String(count)} sub={scene.unitLabel} color={accent} />
            ) : null}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
    </AbsoluteFill>
  );
};

/* --- 5. flow map --- */

const SceneFlowMap: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const accent = scene.accent ?? MAGENTA;
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
      <Field mood={mood} />
      <Rays frame={frame} color={MOODS[mood].ring} />
      <Scenery seed={19} frame={frame} count={4} />
      <StarField count={80} seed={8} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill style={{ top: "16%", height: "42%" }}>
          <svg viewBox="0 0 1080 500" style={{ width: "100%", height: "100%" }}>
            {/* One flat stroke colour — no gradient along the route. */}
            <path
              d={pathD}
              fill="none"
              stroke={CREAM}
              strokeWidth={12}
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
                    r={lit ? 28 : 18}
                    fill={lit ? accent : CREAM}
                  />
                  <text
                    x={nodeX(i)}
                    y={nodeY(i) - 50}
                    // The first and last labels are wide enough to run off the
                    // canvas if they stay centred on their node.
                    textAnchor={i === 0 ? "start" : i === stops.length - 1 ? "end" : "middle"}
                    fill={TEXT}
                    fontSize={34}
                    fontFamily={FONT}
                    fontWeight={800}
                  >
                    {stop}
                  </text>
                </g>
              );
            })}
            {/* traveller: two flat discs, sharp edges */}
            <circle cx={travX} cy={travY} r={30} fill={ORANGE} />
            <circle cx={travX} cy={travY} r={18} fill={AMBER} />
          </svg>
        </AbsoluteFill>
        <AbsoluteFill style={{ top: "52%", alignItems: "center" }}>
          <div style={{ opacity: ease(frame, 30, 40) }}>
            <Bird
              size={190}
              body={AMBER}
              belly={CREAM}
              wing={ORANGE}
              seed={44}
              frame={frame}
            />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
    </AbsoluteFill>
  );
};

/* --- 6. comparison --- */

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
      <Field mood={mood} />
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
            const warm = side.color === AMBER;
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
                  <Rings size={size * 1.34} color={MOODS[mood].ring} count={1} />
                  <Planet
                    size={size}
                    ocean={side.color}
                    land={warm ? ORANGE : LIME}
                    landShade={warm ? CORAL : TEAL}
                    night={warm ? CORAL : ROYAL}
                    ring={CREAM}
                    seed={seed}
                    continents={4}
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
    <AbsoluteFill style={{ backgroundColor: NIGHT_DEEP }}>
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
