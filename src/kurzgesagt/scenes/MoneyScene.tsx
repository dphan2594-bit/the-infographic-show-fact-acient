import { useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { CauseLayout } from "../components/CauseLayout";
import { appear, ramp } from "../anim";
import { causeColors, font, palette } from "../theme";

const ACCENT = causeColors.money;

/**
 * Approximate silver content of the denarius (and of the antoninianus that
 * replaced it). Figures vary by hoard and by issue; these are the rounded
 * consensus values used to show the shape of the collapse, not exact assays.
 */
const COINS = [
  { year: "Năm 1", pct: 98 },
  { year: "Năm 100", pct: 85 },
  { year: "Năm 200", pct: 50 },
  { year: "Năm 250", pct: 15 },
  { year: "Năm 270", pct: 2 },
];

const CHART_HEIGHT = 360;
const BAR_WIDTH = 118;
const GAP = 46;
/** headroom above the tallest bar so its % label never reaches the chart title */
const LABEL_SPACE = 66;

const DebasementChart: React.FC = () => {
  const frame = useCurrentFrame();
  const width = COINS.length * BAR_WIDTH + (COINS.length - 1) * GAP;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div
        style={{
          fontFamily: font.family,
          fontWeight: font.bold,
          fontSize: 27,
          color: palette.muted,
          letterSpacing: "0.04em",
        }}
      >
        Hàm lượng bạc trong đồng denarius
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: GAP,
          height: CHART_HEIGHT + LABEL_SPACE,
          width,
          borderBottom: `3px solid ${palette.muted}55`,
        }}
      >
        {COINS.map((coin, i) => {
          const delay = 30 + i * 11;
          const grow = ramp(frame, delay, delay + 26);
          const labelIn = appear(frame, delay + 10);
          const height = (coin.pct / 100) * CHART_HEIGHT * grow;

          return (
            <div
              key={coin.year}
              style={{
                width: BAR_WIDTH,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: font.family,
                  fontWeight: font.black,
                  fontSize: 40,
                  color: ACCENT,
                  opacity: labelIn,
                  transform: `translateY(${(1 - labelIn) * 10}px)`,
                }}
              >
                {Math.round(coin.pct * grow)}%
              </div>
              <div
                style={{
                  width: "100%",
                  height,
                  backgroundColor: ACCENT,
                  borderRadius: "14px 14px 0 0",
                  /* Later coins are visibly duller — the bar itself loses
                     saturation the same way the coin lost silver. */
                  opacity: 0.45 + (coin.pct / 100) * 0.55,
                }}
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: GAP, width }}>
        {COINS.map((coin, i) => {
          const labelIn = appear(frame, 34 + i * 11);
          return (
            <div
              key={coin.year}
              style={{
                width: BAR_WIDTH,
                textAlign: "center",
                fontFamily: font.family,
                fontWeight: font.bold,
                fontSize: 26,
                color: palette.muted,
                opacity: labelIn,
              }}
            >
              {coin.year}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MoneyScene: React.FC = () => {
  return (
    <SceneShell mood="warm">
      <CauseLayout
        index={2}
        accent={ACCENT}
        title="Đồng tiền bị pha loãng"
        takeaway="Để trả lương quân đội, nhà nước pha loãng bạc — và tự đốt lòng tin vào đồng tiền của mình."
      >
        <DebasementChart />
      </CauseLayout>
    </SceneShell>
  );
};
