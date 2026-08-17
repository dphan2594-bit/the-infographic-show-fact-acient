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
content/
  manifest.example.json  # định dạng manifest — xem "Khớp audio/ảnh/phụ đề tự động"
  manifest.json           # manifest thật của bạn (không commit sẵn, tự tạo)
scripts/
  build-scenes.mjs         # manifest + audio thật → src/scenes/generated.ts
src/
  scenes/
    types.ts     # định nghĩa Scene, Background, Overlay, SceneTransition
    sample.ts     # kịch bản mẫu (Kim Tự Tháp Giza) minh hoạ các archetype
    active.ts     # switch điểm duy nhất: sample.ts hay generated.ts đang render
    generated.ts  # sinh tự động bởi build-scenes.mjs, đừng sửa tay
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

## Khớp audio/ảnh/phụ đề tự động

Khi bạn có sẵn ảnh (AI-generated), audio TTS từng scene và kịch bản chữ, không cần
tự đếm frame để khớp thời lượng — script `build-scenes.mjs` đo **độ dài thật của
từng file audio** rồi tự tính `durationInFrames`, gắn phụ đề đúng thời lượng đó.

**Quy trình:**

1. Thả ảnh vào `public/images/`, audio TTS vào `public/audio/` (mỗi scene 1 file)
2. Tạo `content/manifest.json` (copy từ `content/manifest.example.json`), mỗi phần tử là 1 scene:
   ```json
   {
     "id": "hook",
     "motion": "animate",
     "image": "images/scene-01.png",
     "audio": "audio/scene-01.mp3",
     "caption": "Câu phụ đề khớp với voiceover của scene này.",
     "kenBurns": "zoom-in",
     "transitionIn": { "type": "none" }
   }
   ```
   Scene dạng chapter card thì dùng `chapterTitle`/`chapterSubtitle`/`backgroundColor`
   thay cho `image`. Cần dữ liệu overlay nâng cao (`dataBadge`, `chartLine`,
   `processFlow`, `staggerBadges`...) thì thêm mảng `overlays` (đúng format trong
   `src/scenes/types.ts`) — script sẽ giữ nguyên, ghép thêm vào sau `caption`/`chapterTitle`.
3. Chạy:
   ```console
   npm run build:scenes
   ```
   Script đọc `content/manifest.json`, đo thời lượng từng audio (dùng
   `@remotion/media-parser`, không cần ffmpeg hệ thống), rồi ghi ra
   `src/scenes/generated.ts`.
4. Sửa `src/scenes/active.ts`, đổi dòng export sang:
   ```ts
   export { generatedScenes as activeScenes } from "./generated";
   ```
5. `npm run dev` để xem preview, hoặc render như bình thường — audio giờ phát đúng
   khớp với scene chứa nó (`<Audio>` tự giới hạn trong `durationInFrames` của scene).

Mỗi lần sửa manifest hoặc thay audio, chạy lại `npm run build:scenes` là đủ, không cần
sửa tay `generated.ts`.

### Ảnh đã có chữ/số liệu in sẵn (chart, bản đồ hoàn chỉnh...)

Nhiều ảnh AI-generated (đặc biệt chart/bản đồ số liệu) đã có tiêu đề, chú thích, số
liệu in sẵn ngay trong ảnh — không "sạch chữ" như style guide khuyến nghị cho nhân vật.
Với loại ảnh này, KHÔNG dùng `chapterTitle` (sẽ chồng chữ), chỉ dùng `caption` làm phụ đề
lồng tiếng, và thêm các field sau trong manifest để tránh cắt/đè nội dung ảnh:

- `"kenBurns": "none"` — giữ tĩnh, không zoom/pan làm crop mất số liệu ở rìa ảnh
- `"fit": "contain"` — hiển thị trọn vẹn ảnh, không crop theo kiểu "cover" mặc định
- `"letterboxColor": "#..."` — màu nền lấp khoảng trống khi contain (nên lấy đúng màu nền của ảnh gốc)
- `"captionBar": { "color": "#...", "heightPercent": 14, "position": "bottom" }` — dành
  riêng 1 dải màu đặc (không đè lên ảnh) để đặt phụ đề, ảnh tự thu nhỏ nhường chỗ

Xem ví dụ đầy đủ trong `content/manifest.example.json` (entry `finished-chart-example`).
Nếu tiêu đề ảnh nằm ở rìa còn lại (vd ảnh có chữ sát đáy nhưng đỉnh trống), có thể bỏ
`captionBar` và chỉ set `"caption": {"position": "top"}`-style bằng field `captionPosition`
trên chính entry manifest thay vì dùng dải màu riêng.

## Thêm scene mới thủ công

Chỉnh `src/scenes/sample.ts` (hoặc tạo file scene mới và trỏ `src/scenes/active.ts`
sang đó). Mỗi scene gồm:

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

Mọi overlay đều nhận `entrance`, `delayFrames` và `idle` (xem "Animation presets"
bên dưới) để tự phối stagger nhiều overlay trong cùng 1 scene (vd 2 `dataBadge`
với `entrance: "slideLeft"` / `"slideRight"` cùng lúc = so sánh đối xứng).

## Animation presets (kiểu After Effects)

Thay cho việc kéo-thả preset trong panel *Effects & Presets* của After Effects,
toàn bộ preset ở đây là hàm thuần trong [`src/animation/presets.ts`](src/animation/presets.ts),
gọi bằng tên trong manifest. Hai nhóm:

**`entrance` — chạy 1 lần khi overlay xuất hiện**

| Preset | AE tương ứng | Dùng khi |
|---|---|---|
| `fade` | Fade In | mờ dần đơn giản |
| `fade-up` | Fade Up | chữ/phụ đề — an toàn nhất |
| `pop` | Scale In | badge, callout (mặc định) |
| `overshoot` | Scale In (overshoot) | title nảy, năng lượng cao hơn `pop` |
| `elastic-drop` | Drop In | số liệu rơi xuống, nảy + squash khi chạm |
| `blur-in` | Blur Dissolve | chuyển mềm trên nền ảnh nhiều chi tiết |
| `whip-left` / `whip-right` | Whip Pan | vụt ngang kèm motion blur |
| `flip-in-x` / `flip-in-y` | Flip In | lật thẻ 3D |
| `roll-in` | Roll In | icon badge lăn vào |
| `zoom-punch` | Zoom In | cú nhấn cho hook / số lớn |
| `stamp` | Stamp | đóng dấu, reveal mạnh |
| `wipe-up` / `wipe-right` | Linear Wipe | lộ dần bằng clip-path, không di chuyển |
| `swing-in` | Swing In | đung đưa như biển treo |
| `slideLeft` / `slideRight` / `slideUp` / `slideDown` / `none` | — | bộ cũ, vẫn dùng được |

**`idle` — lặp vô hạn sau khi entrance đã ổn định**

`wiggle` (như biểu thức `wiggle()` của AE), `float`, `pulse`, `sway`, `breathe`,
`none` (mặc định). Idle chỉ bắt đầu sau khi entrance chạy xong và ramp vào trong
8 frame nên không giật.

**Xem thử trước khi chọn:** `npm run dev` rồi mở composition **PresetGallery** —
mỗi preset chạy song song trên 1 ô, lặp mỗi 60 frame.

**Dùng trong manifest:**

```json
{
  "id": "workers",
  "image": "images/scene-03.png",
  "audio": "audio/scene-03.mp3",
  "caption": "Hơn 100.000 công nhân đã tham gia xây dựng.",
  "captionEntrance": "fade-up",
  "overlays": [
    {
      "type": "dataBadge",
      "value": "100K+",
      "x": 72,
      "y": 30,
      "accentColor": "#F2A93B",
      "entrance": "elastic-drop",
      "idle": "float",
      "delayFrames": 18
    }
  ]
}
```

Trên chính entry manifest: `entrance` / `delayFrames` / `idle` áp cho
`chapterTitle`, `captionEntrance` / `captionDelayFrames` / `captionIdle` cho phụ
đề, `dateHudEntrance`... cho widget ngày. Overlay khai báo thẳng trong mảng
`overlays` thì đặt field ngay trên overlay đó. Gõ sai tên preset sẽ bị
`npm run lint` (tsc) báo lỗi trên `src/scenes/generated.ts`.

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
