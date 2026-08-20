import "./index.css";
import { InfographicComposition } from "./Composition";
import { RomeComposition } from "./kurzgesagt/Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <InfographicComposition />
      <RomeComposition />
    </>
  );
};
