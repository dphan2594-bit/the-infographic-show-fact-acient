import { AbsoluteFill, interpolate, Easing } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";

/**
 * Transitions that carry motion across a cut, written against the DOM.
 *
 * Remotion ships shader versions of some of these (zoom-in-out, linear-blur,
 * dissolve), but those draw the scene into a canvas through the HTML-in-Canvas
 * API, which headless Chrome refuses unless the canvas-draw-element flag is on
 * — a render farm can't rely on it. These do the same jobs with transforms,
 * filters and masks, so they render anywhere.
 */

type WhipProps = { direction: "from-left" | "from-right"; blurPx: number };

/** The camera thrown across to the next subject: a fast slide smeared by blur. */
const WhipComponent: React.FC<TransitionPresentationComponentProps<WhipProps>> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const { direction, blurPx } = passedProps;
  // "from-right" = the new scene comes in from the right, so both layers travel left
  const sign = direction === "from-right" ? -1 : 1;
  // ease-out on the way in so the whip lands rather than drifting to a stop
  const eased = interpolate(presentationProgress, [0, 1], [0, 1], {
    easing: Easing.bezier(0.2, 0, 0.1, 1),
  });
  const offset =
    presentationDirection === "exiting" ? eased * 120 * sign : (eased - 1) * 120 * sign;
  // fully smeared at the midpoint, sharp at both ends
  const blur = interpolate(presentationProgress, [0, 0.5, 1], [0, blurPx, 0]);

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${offset}%)`,
        filter: `blur(${blur}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const whipTransition = (
  props: Partial<WhipProps> = {},
): TransitionPresentation<WhipProps> => ({
  component: WhipComponent,
  props: { direction: props.direction ?? "from-right", blurPx: props.blurPx ?? 26 },
});

type ZoomThroughProps = { scale: number };

/**
 * The move keeps going through the cut: the old scene rushes past the camera
 * while the new one is still falling back into place.
 */
const ZoomThroughComponent: React.FC<TransitionPresentationComponentProps<ZoomThroughProps>> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const { scale } = passedProps;
  const eased = interpolate(presentationProgress, [0, 1], [0, 1], {
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  const exiting = presentationDirection === "exiting";
  // outgoing flies at the lens, incoming settles back from beyond it
  const zoom = exiting ? 1 + eased * (scale - 1) : scale - eased * (scale - 1);
  const opacity = exiting
    ? interpolate(eased, [0.35, 1], [1, 0], { extrapolateLeft: "clamp" })
    : interpolate(eased, [0, 0.55], [0, 1], { extrapolateRight: "clamp" });
  // a touch of blur on the fastest part of the move sells the speed
  const blur = interpolate(presentationProgress, [0, 0.5, 1], [0, 8, 0]);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${zoom})`,
        opacity,
        filter: `blur(${blur}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const zoomThroughTransition = (
  props: Partial<ZoomThroughProps> = {},
): TransitionPresentation<ZoomThroughProps> => ({
  component: ZoomThroughComponent,
  props: { scale: props.scale ?? 1.7 },
});

type DissolveProps = { seed: number };

// Deterministic — every frame is rendered in its own browser, so a random
// blob layout would reshuffle on each one and boil.
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const BLOB_COUNT = 26;

const buildBlobs = (seed: number) => {
  const random = mulberry32(seed);
  return Array.from({ length: BLOB_COUNT }, () => ({
    x: random() * 100,
    y: random() * 100,
    // stagger the blobs so the frame breaks up unevenly instead of pulsing
    delay: random() * 0.45,
  }));
};

/** A soft, uneven wash-through — the new scene eats the old one in patches. */
const DissolveComponent: React.FC<TransitionPresentationComponentProps<DissolveProps>> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const blobs = buildBlobs(passedProps.seed);

  if (presentationDirection === "exiting") {
    // the outgoing scene just sits there and is covered up
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const mask = blobs
    .map((blob) => {
      const local = interpolate(presentationProgress, [blob.delay, 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const radius = local * 42;
      return `radial-gradient(circle at ${blob.x}% ${blob.y}%, black 0 ${radius * 0.55}%, transparent ${radius}%)`;
    })
    .join(", ");

  return (
    <AbsoluteFill
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const dissolveTransition = (
  props: Partial<DissolveProps> = {},
): TransitionPresentation<DissolveProps> => ({
  component: DissolveComponent,
  props: { seed: props.seed ?? 7 },
});
