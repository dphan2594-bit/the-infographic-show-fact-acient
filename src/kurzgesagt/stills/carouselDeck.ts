import { causeColors, palette } from "../theme";

export type Slide = {
  /** K1–K8 archetype from docs/SKILL-COSMIC-EXPLAINER.md, Mục 4 */
  archetype: string;
  eyebrow?: string;
  headline: string;
  body?: string;
  accent: string;
  /** Optional AI-generated art in public/images. Falls back to the code-drawn
   *  placeholder so the layout can be reviewed before the art exists. */
  image?: string;
};

/**
 * The 7-slide structure from Mục 7 of the style guide, filled in with the
 * same Rome story as the WhyRomeFell video so the two read as one campaign.
 */
export const DECK: Slide[] = [
  {
    archetype: "K1",
    eyebrow: "Lịch sử",
    headline: "Vì sao đế chế La Mã sụp đổ?",
    body: "Không phải một cú sập. Là bốn vết nứt kéo dài hàng thế kỷ.",
    accent: palette.gold,
  },
  {
    archetype: "K7",
    eyebrow: "Năm 117",
    headline: "5 triệu km². 70 triệu người.",
    body: "Một phần tư nhân loại lúc đó sống dưới quyền La Mã.",
    accent: palette.gold,
  },
  {
    archetype: "K2",
    eyebrow: "Nguyên nhân 01",
    headline: "Quá lớn để tự bảo vệ",
    body: "8.000 km biên giới, chỉ 30 quân đoàn trấn giữ.",
    accent: causeColors.overreach,
  },
  {
    archetype: "K4",
    eyebrow: "Nguyên nhân 02",
    headline: "Đồng tiền bị pha loãng",
    body: "Bạc trong đồng denarius: 98% năm 1, còn 2% năm 270.",
    accent: causeColors.money,
  },
  {
    archetype: "K6",
    eyebrow: "Nguyên nhân 03",
    headline: "26 hoàng đế trong 50 năm",
    body: "Trung bình chưa đầy 2 năm một người. Ai nắm quân thì nắm ngai.",
    accent: causeColors.politics,
  },
  {
    archetype: "K5",
    eyebrow: "Nguyên nhân 04",
    headline: "Sức ép dồn từ bên ngoài",
    body: "Goth, Hung, Vandal — một biên giới đã mỏng thì không chặn nổi.",
    accent: causeColors.pressure,
  },
  {
    archetype: "K8",
    eyebrow: "Năm 476",
    headline: "Rome không bị hạ gục. Rome mục ruỗng.",
    body: "Theo dõi để xem tiếp những đế chế khác đã sụp thế nào.",
    accent: palette.gold,
  },
];
