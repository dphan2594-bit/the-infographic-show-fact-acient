import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { KenBurnsImage } from "./KenBurnsImage";
import type { Background as BackgroundType } from "../scenes/types";

const resolveSrc = (src: string) =>
  src.startsWith("http") ? src : staticFile(src);

export const Background: React.FC<{
  background: BackgroundType;
  durationInFrames: number;
}> = ({ background, durationInFrames }) => {
  if (background.type === "color") {
    return <AbsoluteFill style={{ backgroundColor: background.color }} />;
  }

  if (background.type === "video") {
    return (
      // Slight 1.03 overscale gives camera-shake scenes a safety margin so
      // the clip edge is never revealed (see KenBurnsImage for the same trick).
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo
          src={resolveSrc(background.src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.03)" }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <KenBurnsImage
      src={resolveSrc(background.src)}
      direction={background.kenBurns}
      durationInFrames={durationInFrames}
      fit={background.fit}
      letterboxColor={background.letterboxColor}
    />
  );
};
