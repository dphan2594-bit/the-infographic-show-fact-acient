import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  entrancePresets,
  getPresetStyle,
  idlePresets,
  type EntranceName,
  type IdleName,
} from "./animation/presets";

/**
 * Contact sheet for the After Effects style preset library — the code
 * equivalent of AE's Effects & Presets panel preview. Open the
 * "PresetGallery" composition in `npm run dev` to see every entrance preset
 * play side by side on a loop, then copy the name into a manifest entry.
 */

/** frames per replay of the entrance presets */
const LOOP = 60;
const COLUMNS = 3;
/** horizontal padding of the grid, and margin around each cell */
const GRID_PADDING = 20;
const CELL_MARGIN = 8;
const BG = "#1B1B2A";
const ACCENT = "#6B5CE0";

export const PRESET_GALLERY_DURATION = LOOP * 3;

export const PresetGallery: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const loopFrame = frame % LOOP;
  // divide the *inner* width so exactly COLUMNS cells fit before wrapping
  const cellWidth = Math.floor((width - GRID_PADDING * 2 - CELL_MARGIN * 2 * COLUMNS) / COLUMNS);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: "Arial, sans-serif" }}>
      <div style={{ padding: "36px 40px 12px" }}>
        <div
          style={{
            color: "white",
            fontWeight: 900,
            fontSize: 44,
            letterSpacing: -1,
          }}
        >
          Animation Presets
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontWeight: 600,
            fontSize: 20,
            marginTop: 6,
          }}
        >
          entrance — replays every {LOOP} frames · use the name in{" "}
          <span style={{ color: ACCENT }}>overlay.entrance</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          padding: `0 ${GRID_PADDING}px`,
        }}
      >
        {entrancePresets.map((preset) => (
          <EntranceCell
            key={preset.name}
            name={preset.name}
            width={cellWidth}
            style={getPresetStyle({
              frame: loopFrame,
              fps,
              entrance: preset.name,
            })}
          />
        ))}
      </div>

      <div style={{ padding: "24px 40px 12px" }}>
        <div style={{ color: "white", fontWeight: 900, fontSize: 34 }}>Idle loops</div>
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontWeight: 600,
            fontSize: 20,
            marginTop: 6,
          }}
        >
          layered on after the entrance settles ·{" "}
          <span style={{ color: ACCENT }}>overlay.idle</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          padding: `0 ${GRID_PADDING}px`,
        }}
      >
        {idlePresets.map((preset) => (
          <IdleCell key={preset.name} name={preset.name} frame={frame} fps={fps} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const EntranceCell: React.FC<{
  name: EntranceName;
  width: number;
  style: ReturnType<typeof getPresetStyle>;
}> = ({ name, width, style }) => {
  return (
    <div
      style={{
        position: "relative",
        width,
        height: 160,
        margin: CELL_MARGIN,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // keep an oversized entrance (stamp/zoom-punch) inside its own cell
        overflow: "hidden",
      }}
    >
      <div
        style={{
          // the animation area stops above the label, so a preset that
          // overshoots downward (elastic-drop) never sits on top of its name
          position: "absolute",
          inset: "0 0 34px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 118,
            height: 62,
            borderRadius: 12,
            backgroundColor: ACCENT,
            color: "white",
            fontWeight: 900,
            fontSize: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: style.opacity,
            transform: style.transform,
            filter: style.filter,
            clipPath: style.clipPath,
          }}
        >
          Aa
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 12,
          color: "white",
          fontWeight: 700,
          fontSize: 17,
        }}
      >
        {name}
      </div>
    </div>
  );
};

const IdleCell: React.FC<{ name: IdleName; frame: number; fps: number }> = ({
  name,
  frame,
  fps,
}) => {
  // "none" entrance so the cell shows the idle loop alone, running immediately
  const style = getPresetStyle({ frame, fps, entrance: "none", idle: name });

  return (
    <div
      style={{
        width: 156,
        height: 132,
        margin: CELL_MARGIN,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: "#F2A93B",
          opacity: style.opacity,
          transform: style.transform,
        }}
      />
      <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{name}</div>
    </div>
  );
};
