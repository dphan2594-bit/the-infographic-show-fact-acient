import { AbsoluteFill } from "remotion";
import { SpaceBackground } from "../components/SpaceBackground";
import { Orb } from "../components/Orb";
import { Chip, Stat } from "../components/Stat";
import { Settled } from "./Settled";
import { causeColors, font, palette } from "../theme";

export const STYLE_SHEET_WIDTH = 1500;
export const STYLE_SHEET_HEIGHT = 2160;

const SWATCHES: { hex: string; name: string; role: string }[] = [
  { hex: palette.spaceFar, name: "Nền vũ trụ (xa)", role: "Nền chính — luôn cố định" },
  { hex: palette.spaceNear, name: "Nền vũ trụ (gần)", role: "Vùng sáng nhẹ giữa khung" },
  { hex: palette.gold, name: "Vàng", role: "Chủ thể chính, nguồn sáng" },
  { hex: palette.amber, name: "Cam", role: "Biến thể ấm, cảnh báo nhẹ" },
  { hex: palette.coral, name: "San hô", role: "Nguy cơ, mất mát, sụp đổ" },
  { hex: palette.teal, name: "Ngọc", role: "Sống sót, giải pháp" },
  { hex: palette.sky, name: "Xanh trời", role: "Dữ liệu, đo lường, quy mô" },
  { hex: palette.violet, name: "Tím", role: "Lực bên ngoài, cái chưa biết" },
  { hex: palette.paper, name: "Giấy", role: "Chữ tiêu đề" },
  { hex: palette.muted, name: "Mờ", role: "Chữ phụ, nhãn trục" },
];

const RULES = [
  "Nền LUÔN #080B22 — chất keo giữ cả bộ ảnh liền mạch",
  "Tối đa 3 màu accent mỗi khung, không kể nền",
  "Một màu = một ý nghĩa, giữ nguyên xuyên suốt",
  "Không viền nét, không gradient trên vật thể",
  "Chiều sâu đến từ quầng sáng và tương phản kích thước",
  "Chữ tiếng Việt luôn overlay bằng code, không để AI sinh",
];

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: font.family,
      fontWeight: font.bold,
      fontSize: 24,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: palette.muted,
      borderBottom: `2px solid ${palette.muted}33`,
      paddingBottom: 12,
      marginBottom: 30,
    }}
  >
    {children}
  </div>
);

export const StyleSheet: React.FC = () => {
  return (
    <AbsoluteFill>
      <SpaceBackground mood="calm" />
      <Settled at={120}>
        <AbsoluteFill style={{ padding: "80px 90px", color: palette.paper }}>
          <div
            style={{
              fontFamily: font.family,
              fontWeight: font.black,
              fontSize: 78,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Cosmic Flat Vector
          </div>
          <div
            style={{
              fontFamily: font.family,
              fontWeight: font.regular,
              fontSize: 30,
              color: palette.muted,
              marginTop: 10,
              marginBottom: 62,
            }}
          >
            Bảng style cho ảnh tĩnh &amp; video giải thích — docs/SKILL-COSMIC-EXPLAINER.md
          </div>

          <SectionTitle>Bảng màu</SectionTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "22px 54px",
              marginBottom: 62,
            }}
          >
            {SWATCHES.map((s) => (
              <div
                key={s.hex}
                style={{ display: "flex", alignItems: "center", gap: 20 }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 18,
                    backgroundColor: s.hex,
                    border:
                      s.hex === palette.spaceFar
                        ? `2px solid ${palette.muted}55`
                        : "none",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: font.family,
                      fontWeight: font.black,
                      fontSize: 27,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {s.hex.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontFamily: font.family,
                      fontWeight: font.bold,
                      fontSize: 21,
                      color: palette.paper,
                    }}
                  >
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontFamily: font.family,
                      fontWeight: font.regular,
                      fontSize: 19,
                      color: palette.muted,
                    }}
                  >
                    {s.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <SectionTitle>Chữ — Nunito</SectionTitle>
          <div style={{ marginBottom: 58 }}>
            {[
              { w: font.black, size: 62, label: "Black 900 · tiêu đề" },
              { w: font.bold, size: 38, label: "Bold 700 · nhãn, chip" },
              { w: font.regular, size: 32, label: "Regular 400 · câu chốt" },
            ].map((t) => (
              <div
                key={t.label}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 34,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: font.family,
                    fontWeight: t.w,
                    fontSize: t.size,
                    color: palette.paper,
                    minWidth: 640,
                  }}
                >
                  Đế chế sụp đổ vì bốn vết nứt
                </div>
                <div
                  style={{
                    fontFamily: font.family,
                    fontWeight: font.regular,
                    fontSize: 20,
                    color: palette.muted,
                  }}
                >
                  {t.label}
                </div>
              </div>
            ))}
          </div>

          <SectionTitle>Linh kiện</SectionTitle>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 90,
              marginBottom: 58,
            }}
          >
            <Orb size={130} color={palette.gold} glow={1} ring />
            <Stat value={476} label="năm sụp đổ" color={palette.coral} size={78} />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Chip color={causeColors.overreach}>Biên giới quá dài</Chip>
              <Chip color={causeColors.pressure}>Sức ép bên ngoài</Chip>
            </div>
          </div>

          <SectionTitle>Quy tắc</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {RULES.map((rule) => (
              <div
                key={rule}
                style={{
                  display: "flex",
                  gap: 16,
                  fontFamily: font.family,
                  fontWeight: font.regular,
                  fontSize: 26,
                  color: palette.paper,
                }}
              >
                <span style={{ color: palette.teal, fontWeight: font.black }}>
                  ·
                </span>
                {rule}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Settled>
    </AbsoluteFill>
  );
};
