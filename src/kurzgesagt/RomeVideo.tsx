import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { sceneDurations } from "./theme";
import { TitleScene } from "./scenes/TitleScene";
import { PeakScene } from "./scenes/PeakScene";
import { OverreachScene } from "./scenes/OverreachScene";
import { MoneyScene } from "./scenes/MoneyScene";
import { PoliticsScene } from "./scenes/PoliticsScene";
import { PressureScene } from "./scenes/PressureScene";
import { SplitScene } from "./scenes/SplitScene";
import { FallScene } from "./scenes/FallScene";
import { OutroScene } from "./scenes/OutroScene";

export const TRANSITION_FRAMES = 16;

const SCENES = [
  { id: "title", duration: sceneDurations.title, Component: TitleScene },
  { id: "peak", duration: sceneDurations.peak, Component: PeakScene },
  { id: "overreach", duration: sceneDurations.overreach, Component: OverreachScene },
  { id: "money", duration: sceneDurations.money, Component: MoneyScene },
  { id: "politics", duration: sceneDurations.politics, Component: PoliticsScene },
  { id: "pressure", duration: sceneDurations.pressure, Component: PressureScene },
  { id: "split", duration: sceneDurations.split, Component: SplitScene },
  { id: "fall", duration: sceneDurations.fall, Component: FallScene },
  { id: "outro", duration: sceneDurations.outro, Component: OutroScene },
] as const;

/**
 * TransitionSeries overlaps neighbours, so the finished video is shorter than
 * the sum of the scene lengths by one transition per cut.
 */
export const getRomeDurationInFrames = () =>
  SCENES.reduce((total, scene) => total + scene.duration, 0) -
  (SCENES.length - 1) * TRANSITION_FRAMES;

export const RomeVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#080B22" }}>
      <TransitionSeries>
        {SCENES.flatMap((scene, i) => {
          const items = [];
          if (i > 0) {
            items.push(
              <TransitionSeries.Transition
                key={`${scene.id}-transition`}
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />,
            );
          }
          items.push(
            <TransitionSeries.Sequence
              key={scene.id}
              durationInFrames={scene.duration}
            >
              <scene.Component />
            </TransitionSeries.Sequence>,
          );
          return items;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
