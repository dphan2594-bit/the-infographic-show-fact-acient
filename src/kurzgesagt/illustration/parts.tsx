import { palette } from "../theme";

/**
 * Flat-vector illustration primitives. Every part renders as an SVG <g> so a
 * scene can place it, and every shape is a solid fill with no stroke and no
 * gradient — depth comes from overlap and from the glow halos in Glow below.
 */

type Placed = { x: number; y: number; scale?: number; opacity?: number };

const g = (p: Placed) => ({
  transform: `translate(${p.x} ${p.y}) scale(${p.scale ?? 1})`,
  opacity: p.opacity ?? 1,
});

/** Soft radial halo. Needs <Defs/> mounted once per svg. */
export const Glow: React.FC<Placed & { r: number; color: string }> = ({
  r,
  color,
  ...p
}) => (
  <g {...g(p)}>
    <circle r={r} fill={`url(#glow-${color.replace("#", "")})`} />
  </g>
);

/** Registers one radial-gradient per colour used by <Glow>. */
export const Defs: React.FC<{ colors: string[] }> = ({ colors }) => (
  <defs>
    {colors.map((c) => (
      <radialGradient key={c} id={`glow-${c.replace("#", "")}`}>
        <stop offset="0%" stopColor={c} stopOpacity={0.55} />
        <stop offset="55%" stopColor={c} stopOpacity={0.12} />
        <stop offset="100%" stopColor={c} stopOpacity={0} />
      </radialGradient>
    ))}
  </defs>
);

/**
 * The curved surface of a planet filling the bottom of the frame. Drawn as a
 * very large circle so only its top arc is visible — this single shape is what
 * makes a frame read as "standing on a world" rather than floating in a void.
 */
export const PlanetArc: React.FC<{
  /** y of the highest point of the arc */
  top: number;
  /** horizontal half-width of the visible bulge; larger = flatter */
  radius: number;
  centerX: number;
  color: string;
  /** thin lit band along the horizon */
  rimColor?: string;
}> = ({ top, radius, centerX, color, rimColor }) => (
  <g>
    <circle cx={centerX} cy={top + radius} r={radius} fill={color} />
    {rimColor ? (
      <circle
        cx={centerX}
        cy={top + radius + 9}
        r={radius}
        fill="none"
        stroke={rimColor}
        strokeWidth={9}
      />
    ) : null}
  </g>
);

/** Rays fanning out from a star. */
export const SunRays: React.FC<Placed & {
  count: number;
  inner: number;
  length: number;
  color: string;
  rotation?: number;
}> = ({ count, inner, length, color, rotation = 0, ...p }) => (
  <g {...g(p)}>
    {new Array(count).fill(0).map((_, i) => {
      const a = (i / count) * 360 + rotation;
      return (
        <polygon
          key={i}
          points={`-7,${-inner} 7,${-inner} 0,${-(inner + length)}`}
          fill={color}
          transform={`rotate(${a})`}
        />
      );
    })}
  </g>
);

export type Accessory = "none" | "helmet" | "crown" | "spear" | "hood";

/**
 * A minimal creature: one rounded body, two dot eyes, no mouth, no outline.
 * Accessories are what turn the same body into a legionary, an emperor or a
 * migrant — keeping one body shape is what makes the cast feel like a set.
 */
export const Creature: React.FC<Placed & {
  color: string;
  accessory?: Accessory;
  accessoryColor?: string;
  /** shifts both eyes, -1 looks left, 1 looks right */
  look?: number;
}> = ({ color, accessory = "none", accessoryColor, look = 0, ...p }) => {
  const acc = accessoryColor ?? palette.paper;
  return (
    <g {...g(p)}>
      {accessory === "spear" ? (
        <rect x={20} y={-64} width={5} height={92} rx={2} fill={acc} />
      ) : null}

      {/* body: a capsule standing on the ground line at y = 0 */}
      <rect x={-19} y={-46} width={38} height={46} rx={19} fill={color} />
      <ellipse cx={0} cy={-46} rx={19} ry={17} fill={color} />

      <circle cx={-7 + look * 3} cy={-48} r={4.2} fill={palette.paper} />
      <circle cx={7 + look * 3} cy={-48} r={4.2} fill={palette.paper} />

      {accessory === "helmet" ? (
        <>
          <path d="M -20 -52 A 20 20 0 0 1 20 -52 Z" fill={acc} />
          <rect x={-3} y={-78} width={6} height={14} rx={3} fill={acc} />
        </>
      ) : null}
      {accessory === "hood" ? (
        <path d="M -21 -52 A 21 21 0 0 1 21 -52 Z" fill={acc} />
      ) : null}
      {accessory === "crown" ? (
        <polygon
          points="-16,-62 -16,-74 -8,-67 0,-77 8,-67 16,-74 16,-62"
          fill={acc}
        />
      ) : null}
    </g>
  );
};

/** A classical building: columns under a triangular pediment. */
export const Temple: React.FC<Placed & { color: string; roofColor?: string }> = ({
  color,
  roofColor,
  ...p
}) => (
  <g {...g(p)}>
    <polygon points="-52,-58 52,-58 0,-88" fill={roofColor ?? color} />
    <rect x={-54} y={-58} width={108} height={9} rx={3} fill={roofColor ?? color} />
    {[-40, -20, 0, 20, 40].map((x) => (
      <rect key={x} x={x - 5} y={-49} width={10} height={49} rx={3} fill={color} />
    ))}
    <rect x={-56} y={-6} width={112} height={8} rx={3} fill={color} />
  </g>
);

/** A tower with battlements — the repeating unit of the frontier wall. */
export const Tower: React.FC<Placed & { color: string; height?: number }> = ({
  color,
  height = 74,
  ...p
}) => (
  <g {...g(p)}>
    <rect x={-19} y={-height} width={38} height={height} rx={4} fill={color} />
    {[-19, -6, 7].map((x) => (
      <rect key={x} x={x} y={-height - 11} width={12} height={12} fill={color} />
    ))}
  </g>
);

/** A run of battlemented wall between towers. */
export const Wall: React.FC<Placed & {
  width: number;
  color: string;
  height?: number;
}> = ({ width, color, height = 34, ...p }) => (
  <g {...g(p)}>
    <rect x={0} y={-height} width={width} height={height} fill={color} />
    {new Array(Math.max(1, Math.floor(width / 24))).fill(0).map((_, i) => (
      <rect
        key={i}
        x={i * 24}
        y={-height - 10}
        width={13}
        height={10}
        fill={color}
      />
    ))}
  </g>
);

/** A skyline cluster: temple flanked by blocks of housing. */
export const City: React.FC<Placed & {
  color: string;
  accent: string;
  /** 0–1, how much of the city has crumbled into rubble */
  ruin?: number;
}> = ({ color, accent, ruin = 0, ...p }) => {
  const blocks = [
    { x: -128, w: 34, h: 52 },
    { x: -88, w: 28, h: 74 },
    { x: 64, w: 30, h: 66 },
    { x: 100, w: 36, h: 46 },
  ];
  return (
    <g {...g(p)}>
      {blocks.map((b, i) => {
        /* Blocks fall in sequence as ruin advances, tallest first. */
        const fallen = Math.max(0, Math.min(1, ruin * 4 - i));
        return (
          <rect
            key={b.x}
            x={b.x}
            y={-b.h * (1 - fallen * 0.82)}
            width={b.w}
            height={Math.max(4, b.h * (1 - fallen * 0.82))}
            rx={3}
            fill={color}
            opacity={1 - fallen * 0.25}
          />
        );
      })}
      <g opacity={1 - ruin * 0.35}>
        <Temple x={-16} y={0} scale={1 - ruin * 0.06} color={color} roofColor={accent} />
      </g>
    </g>
  );
};

/** A coin seen face-on: rim, field, and a stylised profile. */
export const Coin: React.FC<Placed & {
  r: number;
  color: string;
  rimColor: string;
  /** 0–1 how much silver is left; low values go dull and lose the profile */
  purity?: number;
}> = ({ r, color, rimColor, purity = 1, ...p }) => (
  <g {...g(p)}>
    <circle r={r} fill={rimColor} />
    <circle r={r * 0.86} fill={color} />
    <g opacity={purity}>
      {/* profile: head, then a neck wedge */}
      <circle cx={r * 0.06} cy={-r * 0.14} r={r * 0.3} fill={rimColor} />
      <path
        d={`M ${-r * 0.3} ${r * 0.42} A ${r * 0.42} ${r * 0.42} 0 0 1 ${r * 0.42} ${r * 0.42} Z`}
        fill={rimColor}
      />
    </g>
  </g>
);

export type Ground = { top: number; radius: number; centerX: number };

/**
 * Surface height of a PlanetArc at a given x. Anything standing on the planet
 * must be placed with this — the arc curves away fast, so a fixed y only sits
 * on the ground directly under the centre and floats everywhere else.
 */
export const arcY = (x: number, ground: Ground) => {
  const dx = x - ground.centerX;
  const r = ground.radius;
  return ground.top + r - Math.sqrt(Math.max(0, r * r - dx * dx));
};

/**
 * Tangent angle of the planet surface at x, in degrees. Anything long enough
 * to notice the curvature — a wall, a row of towers — has to be rotated by
 * this or it visibly sinks into the ground at the edges of the frame.
 */
export const arcAngle = (x: number, ground: Ground) => {
  const dx = x - ground.centerX;
  const denom = Math.sqrt(Math.max(1, ground.radius * ground.radius - dx * dx));
  return (Math.atan(dx / denom) * 180) / Math.PI;
};
