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

  const bar = scene.captionBar;
  const barHeightPercent = bar?.heightPercent ?? 16;
  const barPosition = bar?.position ?? "bottom";

  return (
    <AbsoluteFill style={{ transform: combinedTransform || "none" }}>
      <AbsoluteFill
        style={
          bar
            ? barPosition === "bottom"
              ? { top: 0, bottom: "auto", height: `${100 - barHeightPercent}%` }
              : { bottom: 0, top: "auto", height: `${100 - barHeightPercent}%` }
            : undefined
        }
      >
        <Background background={scene.background} durationInFrames={scene.durationInFrames} />
      </AbsoluteFill>
      {bar ? (
        <AbsoluteFill
          style={
            barPosition === "bottom"
              ? { bottom: 0, top: "auto", height: `${barHeightPercent}%`, backgroundColor: bar.color }
              : { top: 0, bottom: "auto", height: `${barHeightPercent}%`, backgroundColor: bar.color }
          }
        />
      ) : null}
      {scene.overlays?.map((overlay, i) => (
        <OverlayRenderer key={i} overlay={overlay} />
      ))}
      {scene.audioSrc ? (
        <Audio src={scene.audioSrc.startsWith("http") ? scene.audioSrc : staticFile(scene.audioSrc)} />
      ) : null}
    </AbsoluteFill>
  );
};
