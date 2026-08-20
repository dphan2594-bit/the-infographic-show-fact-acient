import { useCurrentFrame } from "remotion";
import { appear, pop, ramp } from "../anim";
import { font, palette } from "../theme";

/**
 * Counts from 0 to `value` while the block scales in. Vietnamese number
 * formatting uses "." as the thousands separator.
 */
const formatVi = (n: number, decimals: number) =>
  n.toLocaleString("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const Stat: React.FC<{
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  color: string;
  delay?: number;
  /** frames the count-up takes */
  countFrames?: number;
  decimals?: number;
  size?: number;
}> = ({
  value,
  label,
  suffix,
  prefix,
  color,
  delay = 0,
  countFrames = 40,
  decimals = 0,
  size = 104,
}) => {
  const frame = useCurrentFrame();
  const scale = pop(frame, delay);
  const counted = ramp(frame, delay, delay + countFrames) * value;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        transform: `scale(${scale})`,
        opacity: Math.min(1, scale * 1.6),
      }}
    >
      <div
        style={{
          fontFamily: font.family,
          fontWeight: font.black,
          fontSize: size,
          lineHeight: 1,
          color,
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {prefix}
        {formatVi(counted, decimals)}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: font.family,
          fontWeight: font.bold,
          fontSize: 27,
          letterSpacing: "0.06em",
          color: palette.muted,
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Pill-shaped label used to tag a cause on screen. */
export const Chip: React.FC<{
  children: React.ReactNode;
  color: string;
  delay?: number;
}> = ({ children, color, delay = 0 }) => {
  const progress = appear(useCurrentFrame(), delay);
  return (
    <div
      style={{
        fontFamily: font.family,
        fontWeight: font.bold,
        fontSize: 30,
        color: palette.ink,
        backgroundColor: color,
        padding: "12px 30px",
        borderRadius: 999,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 18}px) scale(${0.9 + progress * 0.1})`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};
