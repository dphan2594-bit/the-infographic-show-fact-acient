import { BODY_FONT } from "../../theme/fonts";
import { AbsoluteFill } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance, Idle } from "../../scenes/types";
import { useFrameScale } from "../../animation/useFrameScale";

const StaggerItem: React.FC<{
  icon: string;
  label: string;
  x: number;
  y: number;
  accentColor: string;
  entrance: Entrance;
  delayFrames: number;
  idle: Idle;
}> = ({ icon, label, x, y, accentColor, entrance, delayFrames, idle }) => {
  const { opacity, transform, filter, clipPath } = useEntranceStyle(entrance, delayFrames, idle);
  const scale = useFrameScale();

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) ${transform}`,
        opacity,
        filter,
        clipPath,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 120 * scale,
          height: 120 * scale,
          borderRadius: "50%",
          backgroundColor: accentColor,
          border: `${6 * scale}px solid white`,
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 50 * scale,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          padding: "4px 14px",
          borderRadius: 8,
          backgroundColor: "rgba(0,0,0,0.65)",
          color: "white",
          fontFamily: BODY_FONT,
          fontWeight: 700,
          fontSize: 17 * scale,
          textTransform: "uppercase",
          letterSpacing: 1,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
};

/**
 * Checklist / comparison grid — each item reveals with a stagger delay,
 * the code equivalent of "Danh sách nhiều icon → Stagger reveal" (Mục 8).
 */
export const StaggerBadgesOverlay: React.FC<{
  items: { icon: string; label: string; x: number; y: number }[];
  accentColor: string;
  staggerFrames?: number;
  entrance?: Entrance;
  delayFrames?: number;
  idle?: Idle;
}> = ({
  items,
  accentColor,
  staggerFrames = 8,
  entrance = "pop",
  delayFrames = 0,
  idle = "none",
}) => {
  return (
    <AbsoluteFill>
      {items.map((item, i) => (
        <StaggerItem
          key={i}
          {...item}
          accentColor={accentColor}
          entrance={entrance}
          delayFrames={delayFrames + i * staggerFrames}
          idle={idle}
        />
      ))}
    </AbsoluteFill>
  );
};
