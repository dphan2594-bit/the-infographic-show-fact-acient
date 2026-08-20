import { AbsoluteFill } from "remotion";
import { Body, Eyebrow, Headline } from "./Type";
import { palette } from "../theme";

/**
 * Shared frame for the four causes: numbered eyebrow and headline pinned to
 * the top, the diagram given the middle, a one-line takeaway at the bottom.
 * Keeping the chrome identical makes the four beats read as a set.
 */
export const CauseLayout: React.FC<{
  index: number;
  title: string;
  takeaway: string;
  accent: string;
  children: React.ReactNode;
}> = ({ index, title, takeaway, accent, children }) => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 130px 74px",
      }}
    >
      <Eyebrow delay={0} color={accent}>
        {`Nguyên nhân ${String(index).padStart(2, "0")}`}
      </Eyebrow>
      <Headline delay={7} size={70} style={{ marginTop: 12 }}>
        {title}
      </Headline>

      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>

      <Body delay={96} size={34} color={palette.paper}>
        {takeaway}
      </Body>
    </AbsoluteFill>
  );
};
