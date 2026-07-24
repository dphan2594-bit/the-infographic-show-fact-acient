import { AbsoluteFill, Audio, staticFile } from "remotion";
import type { Scene as SceneType } from "../scenes/types";
import { Background } from "./Background";
import { OverlayRenderer } from "./OverlayRenderer";
import { useCameraShake, useImpactPunch } from "../animation/useCameraFx";

export const Scene: React.FC<{ scene: SceneType }> = ({ scene }) => {
  const isAnimate = scene.motion === "animate";
  const shake = useCameraShake(isAnimate);
  const punch = useImpactPunch(isAnimate);
  const combinedTransform = [shake.transform, punch.transform]
    .filter((t) => t !== "none")
    .join(" ");

  return (
    <AbsoluteFill style={{ transform: combinedTransform || "none" }}>
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
