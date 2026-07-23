# The Infographics Show — Fact Ancient (Remotion)

Video pipeline dựng bằng [Remotion](https://www.remotion.dev) cho video infographic
phong cách "Flat Vector Explainer" (tham chiếu The Infographics Show). Xem
[`docs/SKILL-FLAT-EXPLAINER.md`](docs/SKILL-FLAT-EXPLAINER.md) cho toàn bộ style guide
(archetype ảnh E1-E10, bảng màu, nguyên tắc tĩnh vs animate).

## Kiến trúc

Remotion đóng vai trò lớp **hậu kỳ / compositing**: ảnh nền (AI-generated, đặt trong
`public/images`) hoặc clip animate (Kling, đặt trong `public/videos`) được ghép với
hiệu ứng Ken Burns và các overlay chữ tiếng Việt render trực tiếp bằng HTML/CSS —
không phụ thuộc AI image gen để sinh chữ (đúng nguyên tắc Mục 2 của style guide).

```
src/
  scenes/
    types.ts     # định nghĩa Scene, Background, Overlay
    sample.ts     # kịch bản mẫu (Kim Tự Tháp Giza) minh hoạ các archetype
  components/
    Background.tsx        # ảnh tĩnh + Ken Burns / video / màu nền
    KenBurnsImage.tsx      # pan/zoom cho ảnh tĩnh
    Scene.tsx              # ghép background + overlays + audio 1 scene
    overlays/
      ChapterTitleOverlay.tsx   # E3 chapter card
      DataBadgeOverlay.tsx      # E9 data callout badge (+ callout line)
      IconLabelOverlay.tsx      # nhãn cho E2 icon badge / E8 process flow
      DateHudOverlay.tsx        # widget mốc năm/ngày (Mục 4.1)
      CaptionOverlay.tsx        # phụ đề/voiceover caption
  InfographicVideo.tsx    # nối các scene bằng <Series>
  Composition.tsx          # đăng ký composition "Infographic" (1920x1080, 30fps)
```

## Thêm scene mới

Chỉnh `src/scenes/sample.ts` (hoặc tạo file scene mới và đổi `defaultProps` trong
`Composition.tsx`). Mỗi scene gồm:

- `background`: `{ type: "image" | "video" | "color", ... }` — ảnh đặt trong
  `public/images/...`, video đặt trong `public/videos/...`
- `overlays`: mảng các lớp chữ/badge overlay bên trên background
- `motion`: `"static" | "animate"` — chỉ để truy vết theo Mục 8 của style guide,
  không ảnh hưởng render
- `durationInFrames`: số frame ở fps 30 (vd 90 frames = 3s)

Ảnh trong `public/images/scene-*.svg` hiện là **placeholder hình học** đứng thay
cho ảnh AI-generated thật — cứ thay `background.src` bằng file ảnh/video thật khi có,
không cần sửa logic overlay.

## Commands

**Cài dependencies**

```console
npm i
```

**Xem preview (Remotion Studio)**

```console
npm run dev
```

**Render video**

```console
npx remotion render Infographic out/video.mp4
```

**Render 1 frame để kiểm tra nhanh**

```console
npx remotion still Infographic out/frame.png --frame=30
```

### Lưu ý môi trường sandbox này

Sandbox này chặn tải Chrome headless mặc định của Remotion
(`remotion.media` không nằm trong allowlist mạng). Dùng Chromium headless shell
đã cài sẵn của Playwright bằng cách set biến môi trường trước khi render:

```console
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx remotion render Infographic out/video.mp4
```

(`remotion.config.ts` tự đọc biến này nếu có.) Ở môi trường khác có thể tải được
Chrome bình thường thì bỏ qua bước này.

## Docs

- Style guide ảnh AI: [`docs/SKILL-FLAT-EXPLAINER.md`](docs/SKILL-FLAT-EXPLAINER.md)
- Remotion fundamentals: https://www.remotion.dev/docs/the-fundamentals
