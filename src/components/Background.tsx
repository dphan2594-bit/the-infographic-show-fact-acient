import { AbsoluteFill, Loop, OffthreadVideo, staticFile } from "remotion";
import { KenBurnsImage } from "./KenBurnsImage";
import type { Background as BackgroundType } from "../scenes/types";

const resolveSrc = (src: string) =>
  src.startsWith("http") ? src : staticFile(src);

const VideoBackground: React.FC<{
  background: Extract<BackgroundType, { type: "video" }>;
  durationInFrames: number;
}> = ({ background, durationInFrames }) => {
  const fitToScene = background.fitToScene ?? "loop";
  const clipDurationInFrames = background.clipDurationInFrames;
  // Clip ngắn hơn scene mới phải xử lý; dài hơn thì Remotion tự cắt.
  const needsFitting =
    clipDurationInFrames !== undefined &&
    clipDurationInFrames > 0 &&
    clipDurationInFrames < durationInFrames;

  const video = (
    // Slight 1.03 overscale gives camera-shake scenes a safety margin so
    // the clip edge is never revealed (see KenBurnsImage for the same trick).
    <OffthreadVideo
      src={resolveSrc(background.src)}
      playbackRate={
        needsFitting && fitToScene === "slow"
          ? clipDurationInFrames / durationInFrames
          : undefined
      }
      style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.03)" }}
    />
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {needsFitting && fitToScene === "loop" ? (
        <Loop durationInFrames={clipDurationInFrames}>{video}</Loop>
      ) : (
        video
      )}
    </AbsoluteFill>
  );
};

export const Background: React.FC<{
  background: BackgroundType;
  durationInFrames: number;
}> = ({ background, durationInFrames }) => {
  if (background.type === "color") {
    return <AbsoluteFill style={{ backgroundColor: background.color }} />;
  }

  if (background.type === "video") {
    return <VideoBackground background={background} durationInFrames={durationInFrames} />;
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
