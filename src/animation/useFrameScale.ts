import { useVideoConfig } from "remotion";

/**
 * Scale factor for anything sized in pixels, so one overlay reads the same in
 * a 1080-wide vertical short and a 1920-wide landscape cut.
 *
 * Everything in this project is authored against a 1080px-wide frame; text and
 * badges then keep the same *relative* size in any composition instead of
 * shrinking to nothing when the frame gets wider.
 */
export const useFrameScale = () => useVideoConfig().width / 1080;
