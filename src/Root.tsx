import "./index.css";
import {
  AnimatedIllustrationComposition,
  InfographicComposition,
  KurzgesagtDemoComposition,
  PresetGalleryComposition,
} from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <InfographicComposition />
      <PresetGalleryComposition />
      <KurzgesagtDemoComposition />
      <AnimatedIllustrationComposition />
    </>
  );
};
