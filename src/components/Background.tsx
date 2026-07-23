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
      <AbsoluteFill>
        <OffthreadVideo src={resolveSrc(background.src)} style={{ objectFit: "cover" }} />
      </AbsoluteFill>
    );
  }

  return (
    <KenBurnsImage
      src={resolveSrc(background.src)}
      direction={background.kenBurns}
      durationInFrames={durationInFrames}
    />
  );
};
