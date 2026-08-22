import "./index.css";
import {
  AnimatedIllustrationComposition,
  InfographicComposition,
  InfographicWideComposition,
  KurzgesagtDemoComposition,
  PresetGalleryComposition,
} from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <InfographicComposition />
      <InfographicWideComposition />
      <PresetGalleryComposition />
      <KurzgesagtDemoComposition />
      <AnimatedIllustrationComposition />
    </>
  );
};
