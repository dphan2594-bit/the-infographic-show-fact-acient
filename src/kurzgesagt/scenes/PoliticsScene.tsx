import { useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { CauseLayout } from "../components/CauseLayout";
import { Stat } from "../components/Stat";
import { appear } from "../anim";
import { causeColors, font, palette } from "../theme";

const ACCENT = causeColors.politics;
const EMPERORS = 26;
const COLUMNS = 13;
/** frames between one emperor taking the throne and the next */
const STEP = 4.5;

/**
 * Each square is a reign: it snaps on in the accent colour, then immediately
 * drains to grey as the next one lights. Run fast enough, the row reads as
 * churn rather than as 26 separate events.
 */
const ReignGrid: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${COLUMNS}, 62px)`,
        gap: 16,
      }}
    >
      {new Array(EMPERORS).fill(0).map((_, i) => {
        const start = 26 + i * STEP;
        const on = appear(frame, start, 26);
        /* Dims once the next two reigns have begun, but keeps enough opacity
           that the finished row still reads as 26 squares. */
        const spent = Math.max(0, Math.min(1, (frame - start - STEP * 2) / 14));

        return (
          <div
            key={i}
            style={{
              width: 62,
              height: 62,
              borderRadius: 14,
              backgroundColor: ACCENT,
              opacity: on * (1 - spent * 0.55),
              transform: `scale(${on * (1 - spent * 0.12)})`,
            }}
          />
        );
      })}
    </div>
  );
};

export const PoliticsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = appear(frame, 20);

  return (
    <SceneShell mood="grim">
      <CauseLayout
        index={3}
        accent={ACCENT}
        title="Không ai ngồi vững trên ngai"
        takeaway="Ai nắm quân đội thì nắm ngai vàng — nên quân đội bận lật đổ hoàng đế hơn là giữ biên giới."
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 44,
          }}
        >
          <div
            style={{
              fontFamily: font.family,
              fontWeight: font.bold,
              fontSize: 28,
              letterSpacing: "0.06em",
              color: palette.muted,
              opacity: captionIn,
            }}
          >
            Khủng hoảng thế kỷ III · năm 235–284
          </div>

          <ReignGrid />

          <div style={{ display: "flex", gap: 120 }}>
            <Stat
              value={26}
              label="hoàng đế"
              color={ACCENT}
              delay={90}
              size={92}
            />
            <Stat
              value={50}
              label="năm"
              color={palette.paper}
              delay={100}
              size={92}
            />
            <Stat
              value={1.9}
              decimals={1}
              label="năm cầm quyền trung bình"
              color={palette.muted}
              delay={110}
              size={92}
            />
          </div>
        </div>
      </CauseLayout>
    </SceneShell>
  );
};
