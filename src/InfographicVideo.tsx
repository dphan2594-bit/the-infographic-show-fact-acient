import { useMemo } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { iris } from "@remotion/transitions/iris";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import type { TransitionPresentation } from "@remotion/transitions";
import type { Scene as SceneType, SceneTransition } from "./scenes/types";
import { Scene } from "./components/Scene";
import { PostFx } from "./components/PostFx";
import { flashTransition } from "./components/FlashTransition";
import {
  whipTransition,
  zoomThroughTransition,
  dissolveTransition,
} from "./components/MotionTransitions";
import { linkCameras } from "./animation/linkCameras";

const DEFAULT_TRANSITION_FRAMES = 12;
// the joins that carry motion need longer than a plain cut to read
const MOTION_TRANSITION_FRAMES = 18;

type ResolvedTransition = {
  presentation: TransitionPresentation<Record<string, unknown>>;
  durationInFrames: number;
};

/**
 * Turns a scene's `transitionIn` into a Remotion presentation.
 *
 * Beyond the plain cuts, these are the joins that make separate stills read as
 * one piece: a flash on the beat, a whip with directional blur, an iris
 * opening on the new subject, and a zoom that carries through the cut.
 */
const resolveTransition = (
  transition: SceneTransition | undefined,
  size: { width: number; height: number },
): ResolvedTransition | null => {
  if (transition?.type === "none") {
    return null;
  }

  const type = transition?.type ?? "fade";
  const motion = type === "whip" || type === "zoom-through" || type === "iris";
  const durationInFrames =
    transition?.durationInFrames ?? (motion ? MOTION_TRANSITION_FRAMES : DEFAULT_TRANSITION_FRAMES);

  const presentation = ((): TransitionPresentation<never> => {
    switch (type) {
      case "flash":
        return flashTransition({
          color: transition && "color" in transition ? transition.color : undefined,
          intensity: transition && "intensity" in transition ? transition.intensity : undefined,
        }) as unknown as TransitionPresentation<never>;
      case "whip":
        return whipTransition({
          direction: transition?.type === "whip" ? transition.direction : undefined,
        }) as unknown as TransitionPresentation<never>;
      case "iris":
        return iris({
          width: size.width,
          height: size.height,
        }) as unknown as TransitionPresentation<never>;
      case "clock-wipe":
        return clockWipe({
          width: size.width,
          height: size.height,
        }) as unknown as TransitionPresentation<never>;
      case "zoom-through":
        return zoomThroughTransition() as unknown as TransitionPresentation<never>;
      case "dissolve":
        return dissolveTransition() as unknown as TransitionPresentation<never>;
      case "slide":
        return slide({
          direction: transition && "direction" in transition ? transition.direction : "from-right",
        }) as unknown as TransitionPresentation<never>;
      case "wipe":
        return wipe({
          direction: transition && "direction" in transition ? transition.direction : "from-left",
        }) as unknown as TransitionPresentation<never>;
      default:
        return fade() as unknown as TransitionPresentation<never>;
    }
  })();

  return {
    presentation: presentation as unknown as TransitionPresentation<Record<string, unknown>>,
    durationInFrames,
  };
};

export const InfographicVideo: React.FC<{ scenes: SceneType[] }> = ({ scenes: input }) => {
  const { width, height } = useVideoConfig();
  // a scene may ask to start its move where the previous one ended, so the
  // camera carries across the cut instead of jumping back
  const scenes = useMemo(() => linkCameras(input), [input]);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <PostFx>
        <TransitionSeries>
          {scenes.flatMap((scene, i) => {
            const transition =
              i === 0 ? null : resolveTransition(scene.transitionIn, { width, height });
            const items = [];
            if (transition) {
              items.push(
                <TransitionSeries.Transition
                  key={`${scene.id}-transition`}
                  presentation={transition.presentation}
                  timing={linearTiming({ durationInFrames: transition.durationInFrames })}
                />,
              );
            }
            items.push(
              <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
                <Scene scene={scene} />
              </TransitionSeries.Sequence>,
            );
            return items;
          })}
        </TransitionSeries>
      </PostFx>
    </AbsoluteFill>
  );
};

export const getTotalDurationInFrames = (scenes: SceneType[]) => {
  const scenesTotal = scenes.reduce((total, scene) => total + scene.durationInFrames, 0);
  const transitionsTotal = scenes.slice(1).reduce((total, scene) => {
    const transition = resolveTransition(scene.transitionIn, { width: 1920, height: 1080 });
    return total + (transition?.durationInFrames ?? 0);
  }, 0);
  return scenesTotal - transitionsTotal;
};
