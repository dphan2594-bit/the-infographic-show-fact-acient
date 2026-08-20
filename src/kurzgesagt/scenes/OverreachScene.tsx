import { useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { CauseLayout } from "../components/CauseLayout";
import { Stat } from "../components/Stat";
import { appear, ramp } from "../anim";
import { causeColors, palette } from "../theme";

const ACCENT = causeColors.overreach;
const LEGIONS = 30;

/**
 * The border stretches outward while the same fixed number of legion dots is
 * redistributed along it — the dots visibly thin out as the ring grows, which
 * is the whole argument of this beat.
 */
const StretchedBorder: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = ramp(frame, 20, 92);
  const radius = 130 + grow * 155;

  return (
    <svg width={720} height={640} viewBox="0 0 720 640">
      <circle
        cx={360}
        cy={320}
        r={radius}
        fill="none"
        stroke={ACCENT}
        strokeWidth={3}
        opacity={0.35}
      />
      <circle cx={360} cy={320} r={78} fill={palette.gold} opacity={0.9} />

      {new Array(LEGIONS).fill(0).map((_, i) => {
        const angle = (i / LEGIONS) * Math.PI * 2 - Math.PI / 2;
        const reveal = appear(frame, 26 + i * 1.4);
        return (
          <circle
            key={i}
            cx={360 + Math.cos(angle) * radius}
            cy={320 + Math.sin(angle) * radius}
            r={9 * reveal}
            fill={ACCENT}
            opacity={0.5 + 0.5 * (1 - grow)}
          />
        );
      })}
    </svg>
  );
};

export const OverreachScene: React.FC = () => {
  return (
    <SceneShell mood="calm">
      <CauseLayout
        index={1}
        accent={ACCENT}
        title="Quá lớn để tự bảo vệ"
        takeaway="Càng bành trướng, mỗi km biên giới càng ít quân giữ — và càng tốn tiền."
      >
        <div style={{ display: "flex", alignItems: "center", gap: 70 }}>
          <StretchedBorder />
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            <Stat
              value={8000}
              label="km đường biên giới"
              color={ACCENT}
              delay={54}
              size={88}
            />
            <Stat
              value={30}
              label="quân đoàn trấn giữ toàn bộ"
              color={palette.paper}
              delay={70}
              size={88}
            />
          </div>
        </div>
      </CauseLayout>
    </SceneShell>
  );
};
