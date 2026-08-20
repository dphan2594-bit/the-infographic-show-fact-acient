import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { font } from "./theme";

/**
 * Nunito is loaded from public/fonts rather than a CDN so renders work
 * offline. Latin and Vietnamese ship as separate subsets — both are needed
 * for the on-screen copy, which is Vietnamese.
 */
const weights = [400, 700, 900] as const;
const subsets = ["latin", "vietnamese"] as const;

export const waitForFonts = Promise.all(
  weights.flatMap((weight) =>
    subsets.map((subset) =>
      loadFont({
        family: font.family,
        url: staticFile(`fonts/nunito-${subset}-${weight}-normal.woff2`),
        weight: String(weight),
        format: "woff2",
      }),
    ),
  ),
);
