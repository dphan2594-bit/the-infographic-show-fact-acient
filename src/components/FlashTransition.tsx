import { AbsoluteFill, interpolate } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";

type FlashProps = { color: string; intensity: number };

/**
 * A cut hidden inside a burst of light: the outgoing scene brightens out, the
 * incoming one arrives already lit, and the wash peaks exactly on the cut.
 *
 * Remotion ships plenty of transitions but not this one, and it is the one an
 * explainer uses most — it reads as a beat change rather than as an effect.
 */
const FlashPresentationComponent: React.FC<TransitionPresentationComponentProps<FlashProps>> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const { color, intensity } = passedProps;
  // brightest in the middle of the transition, gone at both ends
  const wash = interpolate(presentationProgress, [0, 0.5, 1], [0, intensity, 0]);
  // the new scene is only revealed once the wash is bright enough to hide it
  const opacity =
    presentationDirection === "exiting"
      ? interpolate(presentationProgress, [0, 0.5], [1, 0], { extrapolateRight: "clamp" })
      : interpolate(presentationProgress, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
      {presentationDirection === "entering" ? (
        <AbsoluteFill style={{ backgroundColor: color, opacity: wash }} />
      ) : null}
    </AbsoluteFill>
  );
};

export const flashTransition = (
  props: Partial<FlashProps> = {},
): TransitionPresentation<FlashProps> => ({
  component: FlashPresentationComponent,
  props: { color: props.color ?? "#FFFFFF", intensity: props.intensity ?? 0.85 },
});
