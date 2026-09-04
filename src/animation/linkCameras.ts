import type { Scene } from "../scenes/types";
import { resolveCameraPreset } from "./cameraPresets";
import type { CameraConfig, CameraKeyframe } from "./useCamera";

/**
 * Carries the camera across a cut.
 *
 * Two scenes shot from unrelated positions cut badly: the frame jumps, and the
 * viewer re-reads the picture from scratch. A scene marked
 * `camera.continueFromPrevious` starts from exactly the pose the previous
 * scene ended on, so the move looks like one continuous camera travelling
 * through both pictures.
 */

/** the keyframe track a camera config actually plays, whatever form it came in */
const resolveKeyframes = (camera: CameraConfig | undefined): CameraKeyframe[] | null => {
  if (!camera) {
    return null;
  }
  if (camera.keyframes && camera.keyframes.length > 0) {
    return camera.keyframes;
  }
  if (camera.preset) {
    return (
      resolveCameraPreset({
        preset: camera.preset,
        focusX: camera.focusX,
        focusY: camera.focusY,
        intensity: camera.intensity,
      }).keyframes ?? null
    );
  }
  return [
    { at: 0, zoom: camera.zoomFrom ?? 1, focusX: 50, focusY: 50 },
    {
      at: 100,
      zoom: camera.zoomTo ?? 1,
      focusX: 50 - (camera.panXPercent ?? 0),
      focusY: 50 - (camera.panYPercent ?? 0),
    },
  ];
};

const link = (
  camera: CameraConfig | undefined,
  previous: CameraConfig | undefined,
): CameraConfig | undefined => {
  if (!camera?.continueFromPrevious) {
    return camera;
  }
  const previousTrack = resolveKeyframes(previous);
  const ownTrack = resolveKeyframes(camera);
  if (!previousTrack || !ownTrack) {
    return camera;
  }

  const handover = previousTrack[previousTrack.length - 1];
  // keep the scene's own poses, but enter on the previous scene's last one
  const keyframes: CameraKeyframe[] = [
    { ...handover, at: 0 },
    ...ownTrack.filter((keyframe) => keyframe.at > 0),
  ];

  return { ...camera, preset: undefined, keyframes };
};

export const linkCameras = (scenes: Scene[]): Scene[] =>
  scenes.map((scene, index) => {
    if (index === 0) {
      return scene;
    }
    const previous = scenes[index - 1];
    const camera = link(scene.camera, previous.camera);
    const cameraVertical = link(scene.cameraVertical, previous.cameraVertical ?? previous.camera);
    const cameraWide = link(scene.cameraWide, previous.cameraWide ?? previous.camera);

    if (
      camera === scene.camera &&
      cameraVertical === scene.cameraVertical &&
      cameraWide === scene.cameraWide
    ) {
      return scene;
    }
    return { ...scene, camera, cameraVertical, cameraWide };
  });
