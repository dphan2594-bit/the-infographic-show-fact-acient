import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Overlay, Scene as SceneType } from "../scenes/types";
import { Background } from "./Background";
import { OverlayRenderer } from "./OverlayRenderer";
import { useCameraShake, useImpactPunch } from "../animation/useCameraFx";
import { useCameraTransform } from "../animation/useCamera";

/**
 * Overlays that belong to the frame rather than to the picture.
 *
 * Captions and titles have to stay centred and inside the safe area, and
 * atmosphere layers should keep their density instead of being magnified by a
 * push-in — so the camera must not touch them. Everything else is anchored to
 * a spot in the artwork (a glow on a painted sun, an orbiting body, a badge
 * pointing at something) and has to travel with it.
 */
const FRAME_LOCKED: ReadonlySet<string> = new Set([
  "caption",
  "chapterTitle",
  "dateHud",
  "starLayer",
  "driftParticles",
  "shootingStars",
]);

const isFrameLocked = (overlay: Overlay) =>
  overlay.lockTo ? overlay.lockTo === "frame" : FRAME_LOCKED.has(overlay.type);

/** frames an overlay takes to fade out when its beat ends */
const BEAT_FADE_OUT = 10;

const BeatFadeOut: React.FC<{ durationInFrames: number; children: React.ReactNode }> = ({
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [durationInFrames - BEAT_FADE_OUT, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/**
 * Renders an overlay, limited to its beat when it declares one. Inside a beat
 * the overlay's clock restarts at 0, so its entrance plays when the beat
 * starts rather than when the scene does.
 */
const TimedOverlay: React.FC<{ overlay: Overlay }> = ({ overlay }) => {
  if (overlay.startFrame === undefined && overlay.endFrame === undefined) {
    return <OverlayRenderer overlay={overlay} />;
  }

  const from = overlay.startFrame ?? 0;
  const durationInFrames =
    overlay.endFrame === undefined ? undefined : Math.max(1, overlay.endFrame - from);

  return (
    <Sequence from={from} durationInFrames={durationInFrames} layout="none">
      {durationInFrames === undefined ? (
        <OverlayRenderer overlay={overlay} />
      ) : (
        <BeatFadeOut durationInFrames={durationInFrames}>
          <OverlayRenderer overlay={overlay} />
        </BeatFadeOut>
      )}
    </Sequence>
  );
};

export const Scene: React.FC<{ scene: SceneType }> = ({ scene }) => {
  const isAnimate = scene.motion === "animate";
  const shake = useCameraShake(isAnimate);
  const punch = useImpactPunch(isAnimate);

  // The same scene list renders both a 9:16 and a 16:9 composition, and a move
  // framed for one shape rarely works on the other — so a scene may carry a
  // camera per orientation, falling back to the shared one.
  const { width, height } = useVideoConfig();
  const camera = (height > width ? scene.cameraVertical : scene.cameraWide) ?? scene.camera;
  const cameraTransform = useCameraTransform(camera, scene.durationInFrames);
  const combinedTransform = [cameraTransform, shake.transform, punch.transform]
    .filter((t) => t && t !== "none")
    .join(" ");

  const bar = scene.captionBar;
  const barHeightPercent = bar?.heightPercent ?? 16;
  const barPosition = bar?.position ?? "bottom";
  const overlays = scene.overlays ?? [];

  return (
    <AbsoluteFill>
      {/* everything the camera moves: the artwork and whatever is pinned to it */}
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
          <Background
            background={scene.background}
            durationInFrames={scene.durationInFrames}
            // the camera already knows what this shot is about — reuse it so a
            // wide image cropped into a vertical frame keeps the subject
            focusX={camera?.focusX}
            focusY={camera?.focusY}
          />
        </AbsoluteFill>
        {overlays
          .filter((overlay) => !isFrameLocked(overlay))
          .map((overlay, i) => (
            <TimedOverlay key={`image-${i}`} overlay={overlay} />
          ))}
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

      {/* text and atmosphere: pinned to the frame, never dragged by the camera */}
      {overlays.filter(isFrameLocked).map((overlay, i) => (
        <TimedOverlay key={`frame-${i}`} overlay={overlay} />
      ))}

      {scene.audioSrc ? (
        <Audio
          src={scene.audioSrc.startsWith("http") ? scene.audioSrc : staticFile(scene.audioSrc)}
        />
      ) : null}
    </AbsoluteFill>
  );
};
