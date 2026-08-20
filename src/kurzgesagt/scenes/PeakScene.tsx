import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Stat } from "../components/Stat";
import { Body, Eyebrow, Headline } from "../components/Type";
import { ramp } from "../anim";
import { palette } from "../theme";

/**
 * A filled arc that sweeps out to show how much of the known world Rome held
 * at its greatest extent, under Trajan in 117 AD.
 */
const ReachArc: React.FC = () => {
  const frame = useCurrentFrame();
  const t = ramp(frame, 24, 96);
  const radius = 150;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width={420} height={420} viewBox="0 0 420 420">
      <circle
        cx={210}
        cy={210}
        r={radius}
        fill="none"
        stroke={`${palette.muted}44`}
        strokeWidth={26}
      />
      <circle
        cx={210}
        cy={210}
        r={radius}
        fill="none"
        stroke={palette.gold}
        strokeWidth={26}
        strokeLinecap="round"
        strokeDasharray={circumference}
        /* A quarter of humanity — the arc stops at 25% of the ring. */
        strokeDashoffset={circumference * (1 - t * 0.25)}
        transform="rotate(-90 210 210)"
      />
    </svg>
  );
};

export const PeakScene: React.FC = () => {
  return (
    <SceneShell mood="calm">
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <Eyebrow delay={0} color={palette.gold}>
          Năm 117 sau Công nguyên
        </Eyebrow>
        <Headline delay={8} size={78}>
          Đỉnh cao quyền lực
        </Headline>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 90,
            marginTop: 34,
          }}
        >
          <Stat
            value={5}
            label="triệu km² lãnh thổ"
            color={palette.sky}
            delay={40}
            size={96}
          />

          <div style={{ position: "relative" }}>
            <ReachArc />
            <AbsoluteFill
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stat
                value={25}
                suffix="%"
                label="dân số thế giới"
                color={palette.gold}
                delay={54}
                size={82}
              />
            </AbsoluteFill>
          </div>

          <Stat
            value={70}
            label="triệu người dân"
            color={palette.teal}
            delay={68}
            size={96}
          />
        </div>

        <Body delay={92} size={34} color={palette.paper} style={{ marginTop: 62 }}>
          Chưa nhà nước nào ở châu Âu lớn đến thế — và cũng chưa nhà nước nào tốn kém đến thế.
        </Body>
      </AbsoluteFill>
    </SceneShell>
  );
};
