import { useCurrentFrame } from "remotion";
import { appear } from "../anim";
import { font, palette } from "../theme";

type TextProps = {
  children: React.ReactNode;
  delay?: number;
  color?: string;
  align?: "left" | "center";
  style?: React.CSSProperties;
};

const rise = (progress: number): React.CSSProperties => ({
  opacity: progress,
  transform: `translateY(${(1 - progress) * 26}px)`,
});

export const Headline: React.FC<TextProps & { size?: number }> = ({
  children,
  delay = 0,
  color = palette.paper,
  align = "center",
  size = 92,
  style,
}) => {
  const progress = appear(useCurrentFrame(), delay);
  return (
    <div
      style={{
        fontFamily: font.family,
        fontWeight: font.black,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: "-0.02em",
        color,
        textAlign: align,
        ...rise(progress),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Body: React.FC<TextProps & { size?: number }> = ({
  children,
  delay = 0,
  color = palette.muted,
  align = "center",
  size = 38,
  style,
}) => {
  const progress = appear(useCurrentFrame(), delay);
  return (
    <div
      style={{
        fontFamily: font.family,
        fontWeight: font.regular,
        fontSize: size,
        lineHeight: 1.42,
        color,
        textAlign: align,
        ...rise(progress),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Small all-caps eyebrow used to number the four causes. */
export const Eyebrow: React.FC<TextProps> = ({
  children,
  delay = 0,
  color = palette.muted,
  align = "center",
  style,
}) => {
  const progress = appear(useCurrentFrame(), delay);
  return (
    <div
      style={{
        fontFamily: font.family,
        fontWeight: font.bold,
        fontSize: 26,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        textAlign: align,
        ...rise(progress),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
