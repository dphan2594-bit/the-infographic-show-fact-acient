import { Sequence } from "remotion";

/**
 * Stills render at frame 0, where every spring entrance is still at zero.
 * A Sequence with a negative `from` shifts the inner clock forward, so the
 * animated components can be reused at their settled state instead of being
 * duplicated as static markup.
 */
export const Settled: React.FC<{ children: React.ReactNode; at?: number }> = ({
  children,
  at = 90,
}) => <Sequence from={-at}>{children}</Sequence>;
