import { AbsoluteFill, Series } from "remotion";
import type { Scene as SceneType } from "./scenes/types";
import { Scene } from "./components/Scene";

export const InfographicVideo: React.FC<{ scenes: SceneType[] }> = ({ scenes }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Series>
        {scenes.map((scene) => (
          <Series.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
            <Scene scene={scene} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

export const getTotalDurationInFrames = (scenes: SceneType[]) =>
  scenes.reduce((total, scene) => total + scene.durationInFrames, 0);
