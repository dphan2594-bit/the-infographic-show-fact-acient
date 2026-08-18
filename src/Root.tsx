import "./index.css";
import {
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
    </>
  );
};
