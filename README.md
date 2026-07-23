# The Infographics Show — Fact Ancient (Remotion)

Video pipeline dựng bằng [Remotion](https://www.remotion.dev) cho video infographic
phong cách "Flat Vector Explainer" (tham chiếu The Infographics Show). Xem
[`docs/SKILL-FLAT-EXPLAINER.md`](docs/SKILL-FLAT-EXPLAINER.md) cho toàn bộ style guide
(archetype ảnh E1-E10, bảng màu, nguyên tắc tĩnh vs animate).

## Kiến trúc

Remotion đóng vai trò lớp **hậu kỳ / compositing / motion graphics**: ảnh nền
(AI-generated, đặt trong `public/images`) hoặc clip animate (Kling, đặt trong
`public/videos`) được ghép với hiệu ứng Ken Burns, overlay chữ tiếng Việt render
trực tiếp bằng HTML/CSS (không phụ thuộc AI image gen để sinh chữ — Mục 2 style
guide), và toàn bộ motion graphics ở Mục 8 của style guide (scale-in "pop",
slide-in, stagger reveal, line-draw chart, chuyển cảnh wipe/slide) được dựng
bằng code thay vì CapCut.

```
src/
  scenes/
    types.ts     # định nghĩa Scene, Background, Overlay, SceneTransition
    sample.ts     # kịch bản mẫu (Kim Tự Tháp Giza) minh hoạ các archetype
  animation/
    useEntranceStyle.ts   # hook entrance dùng chung: pop / slideX / fade / none
  components/
    Background.tsx        # ảnh tĩnh + Ken Burns / video / màu nền
    KenBurnsImage.tsx      # pan/zoom cho ảnh tĩnh
    Scene.tsx              # ghép background + overlays + audio 1 scene
    overlays/
      ChapterTitleOverlay.tsx   # E3 chapter card (badge + title + subtitle stagger)
      DataBadgeOverlay.tsx      # E9 data callout badge (+ callout line vẽ dần)
      IconLabelOverlay.tsx      # nhãn cho E2 icon badge
      DateHudOverlay.tsx        # widget mốc năm/ngày (Mục 4.1)
      CaptionOverlay.tsx        # phụ đề/voiceover caption
      StaggerBadgesOverlay.tsx  # checklist/so sánh — stagger reveal
      ChartLineOverlay.tsx      # biểu đồ đường tự vẽ (depletion/growth curve)
      ProcessFlowOverlay.tsx    # E8 process flow — box pop-in + mũi tên tự vẽ
  InfographicVideo.tsx    # nối scene bằng <TransitionSeries> (fade/slide/wipe)
  Composition.tsx          # đăng ký composition "Infographic" (1920x1080, 30fps)
```

## Thêm scene mới

Chỉnh `src/scenes/sample.ts` (hoặc tạo file scene mới và đổi `defaultProps` trong
`Composition.tsx`). Mỗi scene gồm:

- `background`: `{ type: "image" | "video" | "color", ... }` — ảnh đặt trong
  `public/images/...`, video đặt trong `public/videos/...`
- `overlays`: mảng các lớp chữ/badge overlay bên trên background (xem các loại bên dưới)
- `transitionIn`: `{ type: "fade" | "slide" | "wipe" | "none", direction?, durationInFrames? }`
  — cách cắt cảnh VÀO scene này từ scene trước, mặc định fade 12 frame
- `motion`: `"static" | "animate"` — chỉ để truy vết theo Mục 8 của style guide,
  không ảnh hưởng render
- `durationInFrames`: số frame ở fps 30 (vd 90 frames = 3s)

Ảnh trong `public/images/scene-*.svg` hiện là **placeholder hình học** đứng thay
cho ảnh AI-generated thật — cứ thay `background.src` bằng file ảnh/video thật khi có,
không cần sửa logic overlay.

### Overlay có animation

| `type` | Hiệu ứng | Tương ứng Mục 8 |
|---|---|---|
| `chapterTitle` | badge trượt xuống → title pop/scale → subtitle trượt lên, nền có pattern chéo trôi nhẹ | Text animation chapter card |
| `dataBadge` | số liệu pop-in + đường callout tự vẽ tới vị trí liên quan | Scale-in "pop" |
| `iconLabel` | nhãn trượt lên + fade | — |
| `staggerBadges` | danh sách icon/checklist bật lên lần lượt (`staggerFrames` giữa mỗi item) | Stagger reveal |
| `chartLine` | đường biểu đồ tự vẽ tới `drawEndFrame`, có chấm tròn dẫn đầu | Đường vẽ rơi/tăng |
| `processFlow` | các ô process pop-in lần lượt, mũi tên nối tự vẽ ngay sau | E8 Process Flow |
| `dateHud` / `caption` | trượt vào / fade | — |

Hầu hết overlay nhận thêm `entrance` (`"pop" \| "slideLeft" \| "slideRight" \|
"slideUp" \| "slideDown" \| "fade" \| "none"`) và `delayFrames` để tự phối
stagger nhiều overlay trong cùng 1 scene (vd 2 `dataBadge` với
`entrance: "slideLeft"` / `"slideRight"` cùng lúc = so sánh đối xứng).

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
