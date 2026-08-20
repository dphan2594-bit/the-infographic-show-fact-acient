import { useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { CauseLayout } from "../components/CauseLayout";
import { appear, ramp } from "../anim";
import { causeColors, font, palette } from "../theme";

const ACCENT = causeColors.pressure;

/**
 * The canvas is sized so that a label sitting at LABEL_RADIUS from the centre
 * still lands inside the viewBox on every bearing used below — labels drawn
 * outside it get silently clipped by the SVG.
 */
const CANVAS_W = 1320;
const CANVAS_H = 700;
const CX = CANVAS_W / 2;
const CY = 330;

/** Angle in degrees, label, and when the wave fires. */
const WAVES = [
  { angle: 200, label: "Người Goth · 376", delay: 30 },
  { angle: 340, label: "Người Hung · 440s", delay: 52 },
  { angle: 105, label: "Người Vandal · 455", delay: 74 },
];

const START_RADIUS = 300;
const END_RADIUS = 118;
const LABEL_RADIUS = 348;

const IncomingWaves: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <svg
      width={CANVAS_W}
      height={CANVAS_H}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
    >
      {/* Rome, holding the middle. It is squeezed smaller as the arrows land
          rather than faded out, so the disc keeps its colour. */}
      {(() => {
        const pressure = ramp(frame, 60, 140);
        return (
          <>
            <defs>
              <radialGradient id="rome-glow">
                <stop offset="0%" stopColor={palette.gold} stopOpacity={0.5} />
                <stop offset="100%" stopColor={palette.gold} stopOpacity={0} />
              </radialGradient>
            </defs>
            <circle
              cx={CX}
              cy={CY}
              r={150 - pressure * 14}
              fill="url(#rome-glow)"
            />
            <circle
              cx={CX}
              cy={CY}
              r={74 - pressure * 12}
              fill={palette.gold}
            />
          </>
        );
      })()}

      {WAVES.map((wave) => {
        const rad = (wave.angle * Math.PI) / 180;
        const travel = ramp(frame, wave.delay, wave.delay + 40);
        const fadeIn = appear(frame, wave.delay);

        const radius = START_RADIUS - (START_RADIUS - END_RADIUS) * travel;
        const tipX = CX + Math.cos(rad) * radius;
        const tipY = CY + Math.sin(rad) * radius;
        /* Tail trails 90px behind the tip, along the same bearing. */
        const tailX = CX + Math.cos(rad) * (radius + 96);
        const tailY = CY + Math.sin(rad) * (radius + 96);

        const labelX = CX + Math.cos(rad) * LABEL_RADIUS;
        const labelY = CY + Math.sin(rad) * LABEL_RADIUS;

        return (
          <g key={wave.label} opacity={fadeIn}>
            <line
              x1={tailX}
              y1={tailY}
              x2={tipX}
              y2={tipY}
              stroke={ACCENT}
              strokeWidth={13}
              strokeLinecap="round"
            />
            {/* Arrowhead: a triangle rotated to point at the centre. */}
            <polygon
              points="0,-15 30,0 0,15"
              fill={ACCENT}
              transform={`translate(${tipX} ${tipY}) rotate(${wave.angle + 180})`}
            />
            <text
              x={labelX}
              y={labelY}
              fill={palette.paper}
              fontFamily={font.family}
              fontWeight={font.bold}
              fontSize={26}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {wave.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const PressureScene: React.FC = () => {
  return (
    <SceneShell mood="grim">
      <CauseLayout
        index={4}
        accent={ACCENT}
        title="Sức ép dồn từ bên ngoài"
        takeaway="Các dân tộc phía bắc bị đẩy về phía nam — và một biên giới đã mỏng thì không chặn nổi."
      >
        <IncomingWaves />
      </CauseLayout>
    </SceneShell>
  );
};
