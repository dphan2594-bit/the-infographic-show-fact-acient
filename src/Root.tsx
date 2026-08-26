import "./index.css";
import { loadFonts } from "./theme/fonts";
import {
  AnimatedIllustrationComposition,
  InfographicComposition,
  InfographicWideComposition,
  KurzgesagtDemoComposition,
  PresetGalleryComposition,
} from "./Composition";

loadFonts();

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
