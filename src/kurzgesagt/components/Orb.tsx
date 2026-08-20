import { useCurrentFrame } from "remotion";
import { appear, drift } from "../anim";
import { palette } from "../theme";

type OrbProps = {
  size: number;
  color: string;
  delay?: number;
  /** 0–1, how bright the halo behind the disc burns */
  glow?: number;
  /** draws a thin orbit ring around the disc */
  ring?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

/**
 * A flat disc with a soft halo. The disc itself takes a single solid fill —
 * depth in this style comes from the halo and from overlapping shapes, never
 * from shading the object.
 */
export const Orb: React.FC<OrbProps> = ({
  size,
  color,
  delay = 0,
  glow = 0.7,
  ring = false,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = appear(frame, delay);
  const breathe = 1 + Math.sin(frame / 26) * 0.012;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        transform: `scale(${progress * breathe})`,
        opacity: progress,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -size * 0.55,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}${Math.round(glow * 90)
            .toString(16)
            .padStart(2, "0")} 0%, transparent 62%)`,
        }}
      />
      {ring ? (
        <div
          style={{
            position: "absolute",
            inset: -size * 0.22,
            borderRadius: "50%",
            border: `3px solid ${color}55`,
            transform: `rotate(${drift(frame, 6)}deg)`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: palette.ink,
        }}
      >
        {children}
      </div>
    </div>
  );
};
