// Xây prompt ảnh/video cuối cùng từ mô tả ngắn trong manifest.
//
// Manifest chỉ mang phần *chủ thể* của cảnh ("a nomadic herder holding a
// handful of millet seeds"); toàn bộ phần khiến ảnh khớp phong cách kênh —
// cách diễn đạt bảng màu, nét viền/đổ bóng, ràng buộc không-chữ — được ghép ở
// đây theo "Công thức prompt chung" (Mục 3) và nguyên tắc "chữ không do AI
// sinh" (Mục 2) của docs/SKILL-FLAT-EXPLAINER.md, để mọi scene đồng nhất.

/** Negative prompt gợi ý ở Mục 3. */
export const DEFAULT_NEGATIVE_PROMPT =
  "3D render, photorealistic, watercolor, painterly texture, gradient shading, " +
  "complex background detail, text, watermark, logo";

/** Các style token của Mục 3, giữ nguyên thứ tự trong tài liệu. */
const STYLE_TOKENS = [
  "minimal geometric shapes",
  "bold clean outlines",
  "no gradients",
  "no texture",
  "corporate explainer video style",
  "simple facial features",
  "high contrast",
  "clean vector art",
  "2D flat design",
];

/**
 * Mục 2: AI sinh chữ tiếng Việt có dấu rất kém, và mọi nhãn trong pipeline này
 * đều là overlay Remotion — nên ảnh phải về sạch chữ, không thương lượng.
 */
const NO_TEXT_TOKENS = ["no text", "no watermark"];

const LEAD_IN = {
  image: "Flat vector illustration",
  video: "Flat vector 2D animation",
};

/**
 * Prompt cho image-to-video ("animate") khác hẳn text-to-image: phong cách,
 * bảng màu và bố cục đã nằm sẵn trong ảnh nguồn, nhồi lại cả công thức Mục 3
 * chỉ khiến model vẽ lại từ đầu. Ở đây chỉ mô tả CHUYỂN ĐỘNG, cộng một neo giữ
 * cho clip không trôi khỏi phong cách ảnh gốc.
 */
const ANIMATE_TOKENS = [
  "smooth natural motion",
  "keep the original flat vector style and colors",
  "consistent character design",
];

function normalizePalette(palette) {
  if (!palette) return null;
  const parts = Array.isArray(palette) ? palette : [palette];
  const names = parts.map((p) => String(p).trim()).filter(Boolean);
  if (names.length === 0) return null;
  // Mục 5: mỗi cảnh 1 cặp màu, không trộn quá 4 màu.
  if (names.length > 4) {
    throw new Error(
      `"palette" có ${names.length} màu — Mục 5 giới hạn tối đa 4 màu mỗi cảnh.`,
    );
  }
  if (names.some((n) => n.startsWith("#"))) {
    throw new Error(
      `"palette" phải là TÊN màu tiếng Anh cho AI đọc (vd "muted beige and forest green"), ` +
        `không phải mã hex — hex chỉ dùng cho letterboxColor/captionBar trong Remotion.`,
    );
  }
  return `${names.join(" and ")} flat color palette`;
}

/**
 * Bỏ token đã có sẵn trong phần chủ thể để prompt không lặp.
 *
 * So khớp theo từng đoạn ngăn bởi dấu phẩy chứ không phải substring: "no
 * texture" có chứa chuỗi con "no text", nếu so substring thì ràng buộc
 * không-chữ ở Mục 2 sẽ bị nuốt mất.
 */
function withoutDuplicates(tokens, existingText) {
  const segments = new Set(
    existingText
      .toLowerCase()
      .split(",")
      .map((segment) => segment.trim()),
  );
  return tokens.filter((token) => !segments.has(token.toLowerCase()));
}

/**
 * @param {object} options
 * @param {string} options.subject   mô tả chủ thể (tiếng Anh), từ manifest
 * @param {string|string[]} [options.palette]      tên màu, vd ["muted beige", "forest green"]
 * @param {string} [options.composition]           ghi chú bố cục, vd "centered composition"
 * @param {string} [options.motion]                mô tả chuyển động — chỉ dùng cho video
 * @param {"image"|"video"|"animate"} [options.kind] mặc định "image"; "animate" =
 *        image-to-video, chỉ mô tả chuyển động và BỎ QUA palette/composition vì
 *        ảnh nguồn đã quyết định hai thứ đó
 * @param {string} [options.negativePrompt]        ghi đè negative prompt mặc định
 * @returns {{ prompt: string, negativePrompt: string }}
 */
export function buildPrompt({
  subject,
  palette,
  composition,
  motion,
  kind = "image",
  negativePrompt,
}) {
  const trimmedSubject = String(subject ?? "").trim();
  if (!trimmedSubject) {
    throw new Error("Thiếu mô tả chủ thể (imagePrompt/videoPrompt rỗng).");
  }

  const parts =
    kind === "animate"
      ? [trimmedSubject, ...withoutDuplicates(ANIMATE_TOKENS, trimmedSubject)]
      : [LEAD_IN[kind] ?? LEAD_IN.image, trimmedSubject];

  if (kind !== "animate") {
    const paletteClause = normalizePalette(palette);
    if (paletteClause) parts.push(paletteClause);

    parts.push(...withoutDuplicates(STYLE_TOKENS, trimmedSubject));

    if (composition) parts.push(String(composition).trim());
    if (kind === "video" && motion) parts.push(String(motion).trim());
  }

  const assembled = parts.join(", ");
  const noTextTokens = withoutDuplicates(NO_TEXT_TOKENS, assembled);

  return {
    prompt: [assembled, ...noTextTokens].join(", "),
    negativePrompt: negativePrompt ?? DEFAULT_NEGATIVE_PROMPT,
  };
}
