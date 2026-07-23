import { AbsoluteFill } from "remotion";
import { useEntranceStyle } from "../../animation/useEntranceStyle";
import type { Entrance } from "../../scenes/types";

const StaggerItem: React.FC<{
  icon: string;
  label: string;
  x: number;
  y: number;
  accentColor: string;
  entrance: Extract<Entrance, "pop" | "slideUp" | "fade">;
  delayFrames: number;
}> = ({ icon, label, x, y, accentColor, entrance, delayFrames }) => {
  const { opacity, transform } = useEntranceStyle(entrance, delayFrames);

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) ${transform}`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: "50%",
          backgroundColor: accentColor,
          border: "6px solid white",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 46,
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
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          fontSize: 15,
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
  entrance?: Extract<Entrance, "pop" | "slideUp" | "fade">;
}> = ({ items, accentColor, staggerFrames = 8, entrance = "pop" }) => {
  return (
    <AbsoluteFill>
      {items.map((item, i) => (
        <StaggerItem
          key={i}
          {...item}
          accentColor={accentColor}
          entrance={entrance}
          delayFrames={i * staggerFrames}
        />
      ))}
    </AbsoluteFill>
  );
};
