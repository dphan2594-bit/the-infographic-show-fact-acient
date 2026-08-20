import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { CauseLayout } from "../components/CauseLayout";
import { appear, ramp } from "../anim";
import { HEIGHT, WIDTH, causeColors, font, palette } from "../theme";
import {
  Coin,
  Creature,
  Defs,
  Glow,
  PlanetArc,
  arcY,
} from "../illustration/parts";
import type { Ground } from "../illustration/parts";

const ACCENT = causeColors.money;
const GROUND_SHAPE: Ground = { top: 946, radius: 4600, centerX: 960 };
const DULL = "#6B5B3C";

/**
 * Approximate silver content of the denarius, and of the antoninianus that
 * replaced it. Figures vary by hoard and issue; these are rounded consensus
 * values chosen to show the shape of the collapse, not exact assays.
 */
const COINS = [
  { x: 330, year: "Năm 1", pct: 98 },
  { x: 645, year: "Năm 100", pct: 85 },
  { x: 960, year: "Năm 200", pct: 50 },
  { x: 1275, year: "Năm 250", pct: 15 },
  { x: 1590, year: "Năm 270", pct: 2 },
];

const COIN_Y = 545;

/** Blends the bright coin colour toward a dull alloy as purity drops. */
const alloy = (pct: number) => {
  const t = pct / 100;
  const mix = (a: number, b: number) => Math.round(b + (a - b) * t);
  const gold = [255, 182, 39];
  const dull = [107, 91, 60];
  return `rgb(${mix(gold[0], dull[0])}, ${mix(gold[1], dull[1])}, ${mix(gold[2], dull[2])})`;
};

const Treasury: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Defs colors={[ACCENT]} />

      <PlanetArc
        top={GROUND_SHAPE.top}
        radius={GROUND_SHAPE.radius}
        centerX={GROUND_SHAPE.centerX}
        color="#2E2352"
        rimColor="#443579"
      />

      {COINS.map((coin, i) => {
        const delay = 26 + i * 12;
        const reveal = appear(frame, delay);
        const purity = ramp(frame, delay, delay + 22) * (coin.pct / 100);
        /* Later coins visibly sit lower and smaller — worth less, weigh less. */
        const size = 84 - (1 - coin.pct / 100) * 18;

        return (
          <g key={coin.year}>
            <Glow
              x={coin.x}
              y={COIN_Y}
              r={150}
              color={ACCENT}
              opacity={reveal * (coin.pct / 100) * 0.9}
            />
            <Coin
              x={coin.x}
              y={COIN_Y}
              scale={reveal}
              r={size}
              color={alloy(coin.pct)}
              rimColor={DULL}
              purity={purity}
            />
            <text
              x={coin.x}
              y={COIN_Y + 152}
              fill={ACCENT}
              fontFamily={font.family}
              fontWeight={font.black}
              fontSize={44}
              textAnchor="middle"
              opacity={reveal}
            >
              {`${Math.round(coin.pct * ramp(frame, delay, delay + 22))}%`}
            </text>
            <text
              x={coin.x}
              y={COIN_Y + 194}
              fill={palette.muted}
              fontFamily={font.family}
              fontWeight={font.bold}
              fontSize={26}
              textAnchor="middle"
              opacity={reveal}
            >
              {coin.year}
            </text>
          </g>
        );
      })}

      {/* A citizen watching their savings thin out. */}
      <Creature
        x={1810}
        y={arcY(1810, GROUND_SHAPE) + 2}
        scale={1.05 * appear(frame, 96)}
        color={palette.teal}
        look={-1}
      />
      <Creature
        x={130}
        y={arcY(130, GROUND_SHAPE) + 2}
        scale={1.05 * appear(frame, 104)}
        color={palette.sky}
        look={1}
      />
    </svg>
  );
};

export const MoneyScene: React.FC = () => {
  return (
    <SceneShell mood="warm">
      <AbsoluteFill>
        <Treasury />
      </AbsoluteFill>
      <CauseLayout
        index={2}
        accent={ACCENT}
        title="Đồng tiền bị pha loãng"
        takeaway="Để trả lương quân đội, nhà nước pha loãng bạc — và tự đốt lòng tin vào đồng tiền của mình."
      >
        <span />
      </CauseLayout>
    </SceneShell>
  );
};
