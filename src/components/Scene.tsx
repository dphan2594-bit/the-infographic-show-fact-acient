import { AbsoluteFill, Audio, staticFile } from "remotion";
import type { Scene as SceneType } from "../scenes/types";
import { Background } from "./Background";
import { OverlayRenderer } from "./OverlayRenderer";

export const Scene: React.FC<{ scene: SceneType }> = ({ scene }) => {
  return (
    <AbsoluteFill>
      <Background background={scene.background} durationInFrames={scene.durationInFrames} />
      {scene.overlays?.map((overlay, i) => (
        <OverlayRenderer key={i} overlay={overlay} />
      ))}
      {scene.audioSrc ? (
        <Audio src={scene.audioSrc.startsWith("http") ? scene.audioSrc : staticFile(scene.audioSrc)} />
      ) : null}
    </AbsoluteFill>
  );
};
