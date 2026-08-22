import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { Scene as SceneType } from "../scenes/types";
import { Background } from "./Background";
import { OverlayRenderer } from "./OverlayRenderer";
import { useCameraShake, useImpactPunch } from "../animation/useCameraFx";

export const Scene: React.FC<{ scene: SceneType }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const isAnimate = scene.motion === "animate";
  const shake = useCameraShake(isAnimate);
  const punch = useImpactPunch(isAnimate);
  // A scene-level camera move wraps background AND overlays, so code-drawn
  // motion (orbiting dots, glows) stays locked to the artwork it sits on —
  // unlike background.kenBurns, which moves the image out from under them.
  const camera = scene.camera;
  const cameraTransform = camera
    ? (() => {
        const at = (from: number, to: number) =>
          interpolate(frame, [0, scene.durationInFrames], [from, to], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        const zoom = at(camera.zoomFrom ?? 1, camera.zoomTo ?? 1);
        const x = at(0, camera.panXPercent ?? 0);
        const y = at(0, camera.panYPercent ?? 0);
        return `scale(${zoom.toFixed(4)}) translate(${x.toFixed(3)}%, ${y.toFixed(3)}%)`;
      })()
    : "";
  const combinedTransform = [cameraTransform, shake.transform, punch.transform]
    .filter((t) => t && t !== "none")
    .join(" ");

  const bar = scene.captionBar;
  const barHeightPercent = bar?.heightPercent ?? 16;
  const barPosition = bar?.position ?? "bottom";

  return (
    <AbsoluteFill style={{ transform: combinedTransform || "none", overflow: "hidden" }}>
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
              ? {
                  bottom: 0,
                  top: "auto",
                  height: `${barHeightPercent}%`,
                  backgroundColor: bar.color,
                }
              : {
                  top: 0,
                  bottom: "auto",
                  height: `${barHeightPercent}%`,
                  backgroundColor: bar.color,
                }
          }
        />
      ) : null}
      {scene.overlays?.map((overlay, i) => (
        <OverlayRenderer key={i} overlay={overlay} />
      ))}
      {scene.audioSrc ? (
        <Audio
          src={scene.audioSrc.startsWith("http") ? scene.audioSrc : staticFile(scene.audioSrc)}
        />
      ) : null}
    </AbsoluteFill>
  );
};
