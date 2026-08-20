import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Orb } from "../components/Orb";
import { Body, Headline } from "../components/Type";
import { drift, ramp } from "../anim";
import { palette } from "../theme";

/** Expanding rings that read as the empire's reach before we name it. */
const Pulse: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, delay, delay + 90);
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 300 + t * 900,
        height: 300 + t * 900,
        marginLeft: -(300 + t * 900) / 2,
        marginTop: -(300 + t * 900) / 2,
        borderRadius: "50%",
        border: `2px solid ${palette.gold}`,
        opacity: (1 - t) * 0.5,
      }}
    />
  );
};

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell mood="calm">
      <AbsoluteFill>
        <Pulse delay={20} />
        <Pulse delay={65} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Rome itself: one warm disc, the only light source in the frame. */}
        <div style={{ transform: `rotate(${drift(frame, 3)}deg)` }}>
          <Orb size={260} color={palette.gold} glow={1} ring delay={4} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 130px 110px",
          gap: 26,
        }}
      >
        <Headline delay={34} size={92}>
          VÌ SAO ĐẾ CHẾ LA MÃ SỤP ĐỔ?
        </Headline>
        <Body delay={52} size={36}>
          Không phải một cú sập. Là bốn vết nứt kéo dài hàng thế kỷ.
        </Body>
      </AbsoluteFill>
    </SceneShell>
  );
};
