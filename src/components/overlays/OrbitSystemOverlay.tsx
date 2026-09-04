import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance, Idle, OrbitRing } from "../../scenes/types";
import { KURZ, KURZ_ACCENTS } from "../../theme/kurzgesagt";

/**
 * Glowing core with satellites running on tilted elliptical rings — the
 * signature Kurzgesagt "system" diagram (a star with planets, an atom, a
 * galaxy with an orbit marker).
 *
 * Everything about it is continuous: the core breathes, the satellites never
 * stop, and each ring can run at its own speed and direction, so a long hold
 * on this shot still has motion for the eye to follow.
 */
export const OrbitSystemOverlay: React.FC<{
  x: number;
  y: number;
  /** core radius in pixels at 1080 wide; scales with the frame */
  coreRadius?: number;
  coreColor?: string;
  glowColor?: string;
  rings?: OrbitRing[];
  /** draw the glowing core, default true — turn off to reuse a painted sun */
  showCore?: boolean;
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({
  x,
  y,
  coreRadius = 90,
  coreColor = KURZ.violet,
  glowColor = KURZ.cyan,
  rings = [],
  showCore = true,
  entrance = "pop",
  delayFrames = 0,
  idle = "breathe",
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const style = useEntranceStyle(entrance, delayFrames, idle);

  const scale = width / 1080;
  const cx = (x / 100) * width;
  const cy = (y / 100) * height;
  const core = coreRadius * scale;
  const seconds = frame / fps;

  return (
    // the preset transform lives on this div: a CSS transform on an SVG <g>
    // would override its transform attribute and tear the system off-centre
    <AbsoluteFill
      style={{
        opacity: style.opacity,
        transform: style.transform,
        transformOrigin: `${x}% ${y}%`,
      }}
    >
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="orbit-core-glow">
            <stop offset="0%" stopColor={glowColor} stopOpacity={0.55} />
            <stop offset="100%" stopColor={glowColor} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g transform={`translate(${cx} ${cy})`}>
          {/* glow first so rings and satellites read on top of it */}
          {showCore ? <circle r={core * 2.6} fill="url(#orbit-core-glow)" /> : null}
          {rings.map((ring, i) => {
            const rx = ring.radius * scale;
            const ry = rx * (ring.flatten ?? 0.42);
            const tilt = ring.tiltDeg ?? -22;
            const direction = ring.direction === "ccw" ? -1 : 1;
            const period = ring.secondsPerRevolution ?? 6;
            const angle = direction * ((seconds / period) * Math.PI * 2) + (ring.phase ?? 0);
            const satelliteColor = ring.satelliteColor ?? KURZ_ACCENTS[i % KURZ_ACCENTS.length];
            const satelliteSize = (ring.satelliteSize ?? 16) * scale;
            // Ramanujan's approximation — good to ~1e-5 for these ellipses,
            // and we only need it to size the dash pattern
            const h = ((rx - ry) / (rx + ry)) ** 2;
            const circumference = Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
            const pulseArc = ((ring.pulseArcPercent ?? 9) / 100) * circumference;
            const pulsePeriod = ring.pulseSecondsPerRevolution ?? period * 0.55;
            return (
              <g key={i} transform={`rotate(${tilt})`}>
                {ring.showRing === false ? null : (
                  <ellipse
                    rx={rx}
                    ry={ry}
                    fill="none"
                    stroke={ring.color ?? KURZ.cyan}
                    strokeWidth={2.5 * scale}
                    opacity={ring.opacity ?? 0.75}
                  />
                )}
                {ring.pulse ? (
                  <ellipse
                    rx={rx}
                    ry={ry}
                    fill="none"
                    stroke={ring.pulseColor ?? ring.satelliteColor ?? KURZ.cyan}
                    strokeWidth={2 * scale}
                    strokeLinecap="round"
                    strokeDasharray={`${pulseArc} ${circumference}`}
                    strokeDashoffset={-((seconds / pulsePeriod) % 1) * circumference * direction}
                    opacity={0.4}
                  />
                ) : null}
                <g transform={`translate(${Math.cos(angle) * rx} ${Math.sin(angle) * ry})`}>
                  <circle r={satelliteSize} fill={satelliteColor} />
                  {/* same offset highlight as the core, so a satellite drawn
                      over flat artwork matches the painted bodies around it */}
                  <circle
                    cx={-satelliteSize * 0.3}
                    cy={-satelliteSize * 0.3}
                    r={satelliteSize * 0.42}
                    fill={KURZ.star}
                    opacity={0.22}
                  />
                </g>
              </g>
            );
          })}
          {showCore ? (
            <>
              <circle r={core} fill={coreColor} />
              {/* offset highlight — flat art's stand-in for a light source */}
              <circle
                cx={-core * 0.3}
                cy={-core * 0.3}
                r={core * 0.3}
                fill={KURZ.star}
                opacity={0.85}
              />
            </>
          ) : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
