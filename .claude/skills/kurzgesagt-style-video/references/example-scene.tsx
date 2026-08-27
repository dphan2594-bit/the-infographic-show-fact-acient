/**
 * example-scene.tsx — copy-and-rename template for the "Kurzgesagt-style explainer"
 * pipeline.
 *
 * HOW TO USE
 *   1. cp this file to src/<VideoName>.tsx
 *   2. Rename KgExample -> <VideoName>, and the two exported constants
 *      KG_CANVAS / KG_TOTAL_FRAMES -> <NAME>_CANVAS / <NAME>_TOTAL_FRAMES.
 *   3. Replace SCENES with your own list, and point each scene at its voiceover.
 *   4. Register it in src/Composition.tsx (see step 6 of SKILL.md).
 *
 * Everything here is drawn with SVG + CSS. There are NO image or video assets: this
 * style is 100% flat vector, so the whole video is code. That is the single biggest
 * practical difference from the mascot-reaction pipeline next door.
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
 * Palette — luminous accents on a deep field
 * ------------------------------------------------------------------ */

const SPACE = "#0B1026";
const SPACE_DEEP = "#070A1A";
const SPACE_WARM = "#1B1040";

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

/**
 * Continuous float. Every object in this style is always moving a little — a frozen
 * element reads as a bug. Seeded so each object drifts on its own phase.
 */
const float = (frame: number, seed: number, amp = 12, speed = 1) => ({
  x: Math.sin(frame / (52 / speed) + rand(seed) * Math.PI * 2) * amp,
  y: Math.cos(frame / (67 / speed) + rand(seed + 91) * Math.PI * 2) * amp,
});

/** Slow continuous push so no scene ever sits perfectly still. */
const cameraPush = (frame: number, durationInFrames: number, from = 1, to = 1.08) =>
  interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateRight: "clamp",
  });

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
  /** Narration line shown as the caption. A full sentence is fine in this style. */
  caption: string;
  archetype: Archetype;
  durationInFrames: number;
  /** Voiceover under public/ that STARTS on this beat. */
  audio?: string;
  /**
   * How long that voiceover runs, if it outlives this visual beat. Leave unset when
   * the narration fits inside the beat. Set it when one narration line plays across
   * two or three beats (see "one line, several beats" in SKILL.md).
   */
  audioFrames?: number;
  /** Accent the scene is built around. */
  accent?: string;
  /** cosmicHero: small caps label under the hero object. */
  label?: string;
  /** quantity: how many units to draw, and what one unit means. */
  count?: number;
  unitLabel?: string;
  /** compare: the two sides. */
  left?: Side;
  right?: Side;
  /** flowMap: milestone names along the path. */
  stops?: string[];
  /** cutaway: rings from outside in. */
  rings?: { label: string; color: string }[];
};

/**
 * Replace wholesale. Note the pacing: scenes are 6-12s, far longer than the
 * mascot-reaction style's 2-4s cuts. The motion inside a scene carries it.
 */
const SCENES: SceneSpec[] = [
  {
    id: "hook",
    archetype: "cosmicHero",
    caption: "Một nắm hạt nhỏ bé từng là ranh giới giữa sự sống và cái chết.",
    durationInFrames: 240,
    accent: AMBER,
    label: "một nắm hạt",
  },
  {
    id: "compare",
    archetype: "compare",
    caption: "Lúa nước cần 150 ngày. Giống nhanh nhất chỉ mất 45 ngày.",
    durationInFrames: 240,
    left: { label: "Lúa nước", value: "150", weight: 150, color: TEAL },
    right: { label: "Kê", value: "45", weight: 45, color: AMBER },
  },
  {
    id: "crowd",
    archetype: "crowd",
    caption: "Người du mục vừa gieo hạt, vừa tiếp tục di chuyển.",
    durationInFrames: 240,
    accent: MINT,
  },
  {
    id: "quantity",
    archetype: "quantity",
    caption: "Mỗi mùa, một gia đình mang theo hàng ngàn hạt giống.",
    durationInFrames: 210,
    accent: SUN,
    count: 84,
    unitLabel: "hạt giống",
  },
  {
    id: "flow",
    archetype: "flowMap",
    caption: "Từ Trung Á, hạt kê lan tới tận Lưỡng Hà.",
    durationInFrames: 270,
    accent: PINK,
    stops: ["Trung Á", "Cao nguyên Iran", "Lưỡng Hà"],
  },
  {
    id: "close",
    archetype: "cutaway",
    caption: "Một nắm hạt giống đôi khi quý hơn cả thanh kiếm.",
    durationInFrames: 240,
    accent: VIOLET,
    rings: [
      { label: "Vỏ trấu", color: VIOLET },
      { label: "Cám", color: CORAL },
      { label: "Phôi", color: SUN },
    ],
  },
];

export const KG_TOTAL_FRAMES = SCENES.reduce((t, s) => t + s.durationInFrames, 0);

/* ------------------------------------------------------------------ *
 * Shared visual pieces
 * ------------------------------------------------------------------ */

/**
 * Soft light bloom. A radial-gradient div, NOT a huge box-shadow blur: at 1080x1920 a
 * 400px shadow blur on several elements visibly drops the Studio preview framerate,
 * while gradients are effectively free.
 */
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

/** Parallax star field. Three depth layers drift at different rates. */
const StarField: React.FC<{ count?: number; drift?: number }> = ({
  count = 130,
  drift = 1,
}) => {
  const frame = useCurrentFrame();
  const stars = [];
  for (let i = 0; i < count; i++) {
    const depth = 1 + Math.floor(rand(i + 500) * 3); // 1 = far, 3 = near
    const size = depth === 3 ? 4 : depth === 2 ? 3 : 2;
    const twinkle =
      0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / (14 + depth * 7) + rand(i) * 9));
    stars.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${rand(i * 3.1) * 100}%`,
          top: `${rand(i * 7.7 + 13) * 100}%`,
          width: size,
          height: size,
          borderRadius: "50%",
          background: TEXT,
          opacity: twinkle * (depth === 1 ? 0.45 : 0.9),
          transform: `translateY(${(frame / 30) * depth * drift * -6}px)`,
        }}
      />,
    );
  }
  return <AbsoluteFill>{stars}</AbsoluteFill>;
};

/** The deep gradient ground every scene sits on. */
const SpaceBackdrop: React.FC<{ warm?: boolean }> = ({ warm = false }) => (
  <AbsoluteFill
    style={{
      background: warm
        ? `radial-gradient(120% 90% at 50% 25%, ${SPACE_WARM} 0%, ${SPACE_DEEP} 100%)`
        : `radial-gradient(120% 90% at 50% 30%, ${SPACE} 0%, ${SPACE_DEEP} 100%)`,
    }}
  />
);

/**
 * Simple round creature — the recurring "inhabitant" of this style. Deliberately
 * generic (a blob with eyes and feet), not a copy of any studio's character design.
 */
const Creature: React.FC<{
  size: number;
  color: string;
  seed: number;
  highlight?: boolean;
}> = ({ size, color, seed, highlight = false }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 11 + rand(seed) * 8) * (size * 0.05);
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size * 1.15,
        transform: `translateY(${bob}px)`,
      }}
    >
      {highlight ? <Glow size={size * 3} color={color} opacity={0.5} /> : null}
      <svg width={size} height={size * 1.15} viewBox="0 0 100 115">
        <rect x="34" y="100" width="10" height="12" rx="5" fill={AMBER} />
        <rect x="56" y="100" width="10" height="12" rx="5" fill={AMBER} />
        <ellipse cx="50" cy="58" rx="42" ry="48" fill={color} />
        <circle cx="36" cy="50" r="6" fill={SPACE_DEEP} />
        <circle cx="64" cy="50" r="6" fill={SPACE_DEEP} />
      </svg>
    </div>
  );
};

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
          textShadow: "0 4px 24px rgba(0,0,0,0.6)",
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
 * Archetype 1 — cosmic hero
 * ------------------------------------------------------------------ */

/** Ring diameters, shared by the rings and the motes that ride them. */
const ORBIT_RINGS = [380, 470];
/** How squashed the orbits look, i.e. the viewing angle. */
const ORBIT_FLATTEN = 0.23;

const SceneCosmicHero: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const accent = scene.accent ?? AMBER;
  const push = cameraPush(frame, scene.durationInFrames, 1, 1.12);
  const grow = ease(frame, 6, 46);
  const drift = float(frame, 3, 14);
  const labelT = ease(frame, 28, 34);

  return (
    <AbsoluteFill>
      <SpaceBackdrop warm />
      <StarField />
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
              width: 300,
              height: 300,
              transform: `translate(${drift.x}px, ${drift.y}px) scale(${grow})`,
            }}
          >
            <Glow size={880} color={accent} opacity={0.32} />
            {/* orbit rings */}
            {ORBIT_RINGS.map((r, i) => (
              <div
                key={r}
                style={{
                  position: "absolute",
                  width: r,
                  height: r * ORBIT_FLATTEN * 2,
                  left: 150 - r / 2,
                  top: 150 - r * ORBIT_FLATTEN,
                  borderRadius: "50%",
                  border: `2px solid ${TEXT}22`,
                  transform: `rotate(${frame * (i === 0 ? 0.18 : -0.12)}deg)`,
                }}
              />
            ))}
            {/* hero body */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, ${SUN} 0%, ${accent} 55%, ${CORAL} 100%)`,
                boxShadow: `0 0 70px ${accent}70`,
              }}
            />
            {/* Orbiting motes. Radius/flattening are read from the SAME ring sizes
                drawn above so the motes visibly ride the rings instead of floating
                near them, and the phases are evenly spread (a purely random phase
                clumps two or three motes on one side). */}
            {[0, 1, 2, 3, 4].map((i) => {
              const ring = ORBIT_RINGS[i % ORBIT_RINGS.length];
              const radius = ring / 2;
              const speed = 0.5 + (i % ORBIT_RINGS.length) * 0.25;
              const a =
                (frame * speed) / 30 + (i / 5) * Math.PI * 2;
              const size = 16 + rand(i + 11) * 12;
              const color = i % 2 === 0 ? MINT : TEAL;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: size,
                    height: size,
                    left: 150 + Math.cos(a) * radius - size / 2,
                    top: 150 + Math.sin(a) * radius * ORBIT_FLATTEN - size / 2,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 18px ${color}`,
                  }}
                />
              );
            })}
          </div>
          {scene.label ? (
            <div
              style={{
                marginTop: 220,
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
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * Archetype 2 — crowd on a curved horizon
 * ------------------------------------------------------------------ */

const CROWD_SIZE = 9;
const CROWD = Array.from({ length: CROWD_SIZE }, (_, i) => i);

const SceneCrowd: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const accent = scene.accent ?? MINT;
  const push = cameraPush(frame, scene.durationInFrames, 1.04, 1);

  return (
    <AbsoluteFill>
      <SpaceBackdrop />
      <StarField count={90} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {/* planet curve */}
        <div
          style={{
            position: "absolute",
            width: 2600,
            height: 2600,
            left: "50%",
            marginLeft: -1300,
            top: "64%",
            borderRadius: "50%",
            // Stops are bunched near 0% on purpose: the circle is 2600px tall but
            // only its top ~700px is on screen, so gentle stops leave the whole
            // lower frame bright green and white captions stop being readable.
            background: `linear-gradient(180deg, ${accent} 0%, #14603F 7%, #0C2E24 16%, ${SPACE_DEEP} 26%)`,
          }}
        />
        {/* the crowd, walking across the horizon */}
        {CROWD.map((i) => {
          const t = ease(frame, 6 + i * 4, 30);
          // Evenly spaced with only a small jitter. A purely random baseX clumps
          // two or three creatures into one overlapping pile most of the time.
          const baseX = (i / CROWD_SIZE) * 118 + rand(i * 5) * 5;
          const walk = (frame / 30) * 1.8;
          const x = ((baseX + walk) % 118) - 9;
          const size = 74 + rand(i + 3) * 40;
          const highlight = i === 4;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${60 + rand(i + 17) * 6}%`,
                opacity: t,
                transform: `scale(${interpolate(t, [0, 1], [0.7, 1])})`,
              }}
            >
              <Creature
                size={size}
                seed={i}
                color={highlight ? SUN : i % 2 === 0 ? TEAL : VIOLET}
                highlight={highlight}
              />
            </div>
          );
        })}
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * Archetype 3 — cutaway rings
 * ------------------------------------------------------------------ */

const SceneCutaway: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const rings = scene.rings ?? [];
  const push = cameraPush(frame, scene.durationInFrames, 1, 1.06);
  const drift = float(frame, 21, 10);

  return (
    <AbsoluteFill>
      <SpaceBackdrop warm />
      <StarField count={80} />
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
                    background: ring.color,
                    opacity: t * (1 - i * 0.06),
                    transform: `scale(${interpolate(t, [0, 1], [0.86, 1])})`,
                    boxShadow: i === 0 ? `0 0 80px ${ring.color}60` : "none",
                  }}
                />
              );
            })}
            {/* rotating tick marks, so the diagram is never static */}
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
                    background: `${TEXT}44`,
                    transformOrigin: "2px 302px",
                    transform: `rotate(${i * 45}deg)`,
                  }}
                />
              ))}
            </div>
          </div>
          {/* legend */}
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
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * Archetype 4 — quantity field
 * ------------------------------------------------------------------ */

const SceneQuantity: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const accent = scene.accent ?? SUN;
  const count = scene.count ?? 60;
  const push = cameraPush(frame, scene.durationInFrames, 1.05, 1);
  const perRow = 12;
  // Without the number block the column is much shorter, so a big upward offset
  // strands the grid near the top with dead space under it.
  const topOffset = scene.unitLabel ? "-12%" : "-4%";

  const items: number[] = [];
  for (let i = 0; i < count; i++) items.push(i);

  return (
    <AbsoluteFill>
      <SpaceBackdrop />
      <StarField count={60} drift={0.4} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            top: topOffset,
            flexDirection: "column",
            gap: 56,
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
              const wob = Math.sin(i * 1.7) * 4;
              return (
                <div
                  key={i}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50% 50% 50% 14%",
                    background: i % 7 === 0 ? CORAL : accent,
                    opacity: t,
                    transform: `scale(${interpolate(t, [0, 1], [0.2, 1])}) rotate(${wob}deg)`,
                    boxShadow: `0 0 16px ${accent}55`,
                  }}
                />
              );
            })}
          </div>
          {/* Only label the field when the count means something the narration
              actually claims — a big number nobody said is a fabricated statistic. */}
          {scene.unitLabel ? (
            <BigNumber value={String(count)} sub={scene.unitLabel} color={accent} />
          ) : null}
        </AbsoluteFill>
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * Archetype 5 — flow map
 * ------------------------------------------------------------------ */

const SceneFlowMap: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const accent = scene.accent ?? PINK;
  const stops = scene.stops ?? [];
  const push = cameraPush(frame, scene.durationInFrames, 1, 1.05);

  const draw = ease(frame, 8, 80);
  const travel = interpolate(frame, [30, scene.durationInFrames - 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // The path and the traveller are driven by the same maths so they can't drift
  // apart: node i sits at nodeX(i)/nodeY(i), and the traveller interpolates between
  // consecutive nodes.
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
      <SpaceBackdrop warm />
      <StarField count={70} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill style={{ top: "20%", height: "42%" }}>
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
            {/* Traveller — same coordinate space as the path, so it rides the line.
                Its halo is a radial gradient: a flat translucent circle over this
                dark violet backdrop just reads as a grey smudge. */}
            <circle cx={travX} cy={travY} r={40} fill="url(#kgTravellerGlow)" />
            <circle cx={travX} cy={travY} r={17} fill={SUN} />
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
      <Caption frame={frame}>{scene.caption}</Caption>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * Archetype 6 — comparison
 * ------------------------------------------------------------------ */

const SceneCompare: React.FC<{ scene: SceneSpec }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const push = cameraPush(frame, scene.durationInFrames, 1, 1.05);

  const sides: { side: Side; delay: number; seed: number }[] = [];
  if (scene.left) sides.push({ side: scene.left, delay: 8, seed: 41 });
  if (scene.right) sides.push({ side: scene.right, delay: 22, seed: 77 });

  const maxWeight = Math.max(1, ...sides.map((s) => s.side.weight));
  const sizeFor = (w: number) => 130 + (w / maxWeight) * 250;
  // Every disc gets a box as tall as the LARGEST disc. Without this the shorter
  // column is shorter overall, and its number and label sit at a different height
  // from its neighbour's — which reads as a bug rather than as a comparison.
  const boxSize = sizeFor(maxWeight);

  return (
    <AbsoluteFill>
      <SpaceBackdrop />
      <StarField count={70} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill
          style={{
            // One flex row with a fixed gap: the two sides centre as a unit, so they
            // can never collide on one edge while leaving the other side empty.
            flexDirection: "row",
            // Keep this "center". In a ROW container alignItems is the vertical
            // axis, so "flex-end" here does not baseline-align the two sides — it
            // drops the whole group onto the bottom of the frame, on top of the
            // caption. Number alignment is handled by the equal-height disc boxes
            // below instead.
            alignItems: "center",
            justifyContent: "center",
            top: "-10%",
            gap: 80,
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
                  gap: 28,
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
                  <Glow size={size * 2.2} color={side.color} opacity={0.35} />
                  <div
                    style={{
                      width: size,
                      height: size,
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 34% 30%, ${side.color} 0%, ${side.color}CC 60%, ${side.color}77 100%)`,
                      boxShadow: `0 0 50px ${side.color}55`,
                    }}
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
 * Same overlap trick as the mascot-reaction pipeline: a scene starts FADE frames
 * early over the previous scene's still-opaque tail and only fades IN, so no black
 * canvas is ever exposed between scenes. Only the last scene fades out.
 *
 * FADE is longer here (20 frames vs 12) because this style dissolves rather than cuts.
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
    <AbsoluteFill style={{ backgroundColor: SPACE_DEEP }}>
      {SCENES.map((scene, i) => {
        const isFirst = i === 0;
        const isLast = i === SCENES.length - 1;
        // Start FADE frames early (except the first) so scenes overlap and dissolve.
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
        Narration lives at the ROOT, never inside a scene's <Sequence>. A Sequence
        clips its children, so nesting the voiceover inside a visual beat cuts the
        narration off the instant the visuals change. Keeping them separate is what
        lets one narration line play across two or three beats, and it anchors audio
        to the beat's nominal start rather than to the dissolve overlap.
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
