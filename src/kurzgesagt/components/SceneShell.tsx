import { AbsoluteFill } from "remotion";
import { SpaceBackground } from "./SpaceBackground";

/**
 * Every scene paints its own background so TransitionSeries can cross-fade two
 * complete frames. Content sits in a padded column so nothing crowds the edge.
 */
export const SceneShell: React.FC<{
  children: React.ReactNode;
  mood?: "calm" | "warm" | "grim";
  justify?: "center" | "space-between";
}> = ({ children, mood = "calm", justify = "center" }) => {
  return (
    <AbsoluteFill>
      <SpaceBackground mood={mood} />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: justify,
          padding: "88px 130px",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
