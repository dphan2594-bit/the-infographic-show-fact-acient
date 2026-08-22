# Cầu nối Pixelle-Video → Remotion

Sinh ảnh/clip cho từng scene bằng [Pixelle-Video](https://github.com/AIDC-AI/Pixelle-Video),
tải thẳng vào `public/` và ghi đường dẫn ngược lại `content/manifest.json`.

## Phân vai

| Khâu | Ai làm |
|---|---|
| Ảnh / clip nền từng scene | **Pixelle-Video** (ComfyUI, RunningHub, DashScope, Seedream, Kling…) |
| Chữ tiếng Việt, overlay, motion graphics, chuyển cảnh, ghép cảnh, hậu kỳ | **Remotion** (repo này) |

Pixelle-Video có sẵn pipeline trọn gói (kịch bản → ảnh → TTS → ghép video bằng
moviepy). Ở đây **không dùng** phần ghép đó: mọi thứ liên quan tới chữ và motion
graphics vẫn thuộc về Remotion, đúng nguyên tắc Mục 2 của style guide — ảnh AI
phải **không có chữ**, chữ tiếng Việt render bằng HTML/CSS ở lớp overlay.

## 1. Dựng server Pixelle-Video

```bash
git clone https://github.com/AIDC-AI/Pixelle-Video.git
cd Pixelle-Video
cp config.example.yaml config.yaml
```

Điền vào `config.yaml` ít nhất một nguồn sinh ảnh:

* **RunningHub** (không cần cài ComfyUI): `comfyui.runninghub_api_key`, dùng
  workflow `runninghub/image_flux.json`
* **ComfyUI tự host**: `comfyui.comfyui_url`, workflow `selfhost/image_flux.json`
* **API trực tiếp**: điền `api_providers.*` (DashScope, OpenAI, Ark, Kling)

Chạy server:

```bash
uv run python -m api.app     # hoặc ./start_web.sh — mặc định cổng 8000
```

Kiểm tra: `curl http://127.0.0.1:8000/health`

## 2. Viết prompt vào manifest

Thêm các field sau vào scene trong `content/manifest.json`
(xem `content/manifest.example.json`):

| Field | Bắt buộc | Ý nghĩa |
|---|---|---|
| `imagePrompt` | ✔ (nếu muốn sinh ảnh) | **Chủ thể** cảnh, viết bằng tiếng Anh |
| `videoPrompt` | ✔ (nếu muốn sinh clip) | Chủ thể của clip, tiếng Anh |
| `videoMotion` | | Mô tả chuyển động, chỉ áp cho `videoPrompt` |
| `palette` | | Tên màu tiếng Anh, vd `["muted beige", "forest green"]` — tối đa 4 (Mục 5) |
| `composition` | | Ghi chú bố cục, vd `"centered close-up composition"` |
| `negativePrompt` | | Ghi đè negative prompt mặc định |
| `imageWorkflow` / `videoWorkflow` | | Ghi đè workflow cho riêng scene này |

Chỉ viết **chủ thể**, đừng chép lại cả công thức phong cách: phần
"flat vector illustration… no text, no watermark" (Mục 3) được
`scripts/pixelle-prompt.mjs` tự ghép vào để mọi scene đồng nhất.

`palette` phải là **tên màu**, không phải mã hex — hex là thứ Remotion đọc
(`letterboxColor`, `captionBar`), model sinh ảnh thì không.

## 3. Sinh media

```bash
npm run media                          # sinh những asset còn thiếu
npm run media -- --dry-run             # chỉ in prompt cuối cùng, không gọi API
npm run media -- --only scene-01-hook  # chỉ 1 scene
npm run media -- --force               # sinh lại kể cả khi file đã có
npm run media -- --kind video          # chỉ clip
npm run media -- --api http://192.168.1.10:8000
```

Script bỏ qua scene đã có file asset trên đĩa nên chạy lại nhiều lần là an toàn;
một scene lỗi không làm hỏng cả mẻ, các scene còn lại vẫn được ghi vào manifest.

Ảnh về `public/images/<scene-id>.<ext>`, clip về `public/videos/<scene-id>.mp4`,
và `image` / `video` được ghi ngược vào manifest.

Sau đó chạy pipeline như thường lệ:

```bash
node scripts/build-scenes.mjs   # khớp thời lượng theo audio thật
npm run dev
```

## 4. Sinh clip video — cần sidecar

Pixelle-Video gốc **không có** route sinh riêng một clip. Nó chỉ expose:

* `POST /api/image/generate` — một ảnh, và **không nhận** `negative_prompt`
* `POST /api/video/generate` — chạy trọn pipeline (kịch bản → TTS → ghép), không
  dùng được ở đây vì phần ghép đã là việc của Remotion

`scripts/pixelle-sidecar.py` bù đúng chỗ thiếu đó: một app FastAPI mỏng gọi
thẳng `core.media(...)` — hàm vốn đã hỗ trợ `media_type="video"`,
`negative_prompt` và `duration` nhưng chưa được HTTP hoá. Sidecar chạy song song
và **không sửa gì** trong checkout Pixelle-Video.

```bash
cd /đường/dẫn/Pixelle-Video          # nơi có config.yaml
uv run python /đường/dẫn/repo-này/scripts/pixelle-sidecar.py --port 8765
```

Rồi trỏ cầu nối vào sidecar (nó mount luôn route `/api/files` của Pixelle nên
chỉ cần một base URL):

```bash
npm run media -- --api http://127.0.0.1:8765
```

Không có sidecar thì ảnh vẫn chạy được (tự lùi về `/api/image/generate`, kèm
cảnh báo rằng negative prompt bị bỏ qua), còn clip sẽ báo lỗi rõ ràng.

Khi scene có `audio`, cầu nối đo độ dài file TTS rồi truyền `duration` sang
Pixelle, nên clip sinh ra dài đúng bằng lời thoại.

## Cấu hình

| Biến / cờ | Mặc định | |
|---|---|---|
| `PIXELLE_API_URL` / `--api` | `http://127.0.0.1:8000` | base URL Pixelle |
| `--width` / `--height` | `1080` / `1920` | khớp `<Composition>` dọc; API giới hạn 512–2048 |
| `--concurrency` | `1` | RunningHub gói thường chỉ cho 1 job đồng thời |
| `--timeout` | `600` giây | mỗi job |
| `--workflow` | theo config Pixelle | ghi đè cho cả mẻ |

## Lưu ý

* **Một scene chỉ nên có `image` HOẶC `video`.** `build-scenes.mjs` ưu tiên
  `image`, nên scene có cả hai sẽ render ảnh tĩnh và bỏ qua clip — cầu nối có
  cảnh báo khi phát hiện.
* **Ảnh phải sạch chữ.** Prompt luôn kết thúc bằng `no text, no watermark`.
  Nếu model vẫn nhét chữ vào, đổi workflow hoặc thêm `negativePrompt` cho scene đó.
* **Ảnh có sẵn chữ/số liệu** (chart, bản đồ) thì đừng để AI sinh — giữ nguyên
  quy trình `fit: "contain"` + `captionBar` như hiện tại.
* Asset trong `public/` được commit như mọi file media khác của repo; cân nhắc
  dung lượng khi sinh nhiều clip.
