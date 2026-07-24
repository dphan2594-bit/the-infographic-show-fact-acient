import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { TransitionPresentation } from "@remotion/transitions";
import type { Scene as SceneType, SceneTransition } from "./scenes/types";
import { Scene } from "./components/Scene";
import { PostFx } from "./components/PostFx";

const DEFAULT_TRANSITION_FRAMES = 12;

const resolveTransition = (
  transition: SceneTransition | undefined,
): { presentation: TransitionPresentation<Record<string, unknown>>; durationInFrames: number } | null => {
  if (transition?.type === "none") {
    return null;
  }

  const durationInFrames = transition?.durationInFrames ?? DEFAULT_TRANSITION_FRAMES;

  if (!transition || transition.type === "fade") {
    return { presentation: fade(), durationInFrames };
  }

  if (transition.type === "slide") {
    return {
      presentation: slide({ direction: transition.direction ?? "from-right" }),
      durationInFrames,
    };
  }

  return {
    presentation: wipe({ direction: transition.direction ?? "from-left" }),
    durationInFrames,
  };
};

export const InfographicVideo: React.FC<{ scenes: SceneType[] }> = ({ scenes }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <PostFx>
        <TransitionSeries>
          {scenes.flatMap((scene, i) => {
            const transition = i === 0 ? null : resolveTransition(scene.transitionIn);
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
  const transitionsTotal = scenes
    .slice(1)
    .reduce((total, scene) => {
      const transition = resolveTransition(scene.transitionIn);
      return total + (transition?.durationInFrames ?? 0);
    }, 0);
  return scenesTotal - transitionsTotal;
};
