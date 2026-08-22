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
| `videoMotion` | | Mô tả chuyển động — dùng cho `videoPrompt` và **bắt buộc** với `animateFrom` |
| `animateFrom` | | Animate một ảnh đã có → clip (xem mục 5). `true` = dùng chính `image` của scene |
| `fitToScene` | | `loop` (mặc định) / `slow` / `freeze` — cách lấp khi clip ngắn hơn scene |
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
npm run media -- --kind video          # chỉ clip sinh từ chữ
npm run media -- --kind animate        # chỉ clip animate từ ảnh có sẵn
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

## 5. Animate ảnh có sẵn thành clip (image-to-video)

Thay vì để Ken Burns pan/zoom trên ảnh tĩnh, có thể đưa chính ảnh đó cho model
image-to-video (`i2v_LTX2`, `video_wan2.2`, hoặc Kling/Seedance qua `api/…`) để
nó chuyển động thật.

```json
{
  "id": "scene-01-hook",
  "image": "images/scene-01-survival-seeds.jpg",
  "audio": "audio/scene-01-survival-seeds.mp3",
  "animateFrom": true,
  "videoMotion": "the seeds slowly spill between the fingers",
  "fitToScene": "loop"
}
```

```bash
npm run media -- --kind animate --api http://127.0.0.1:8765
node scripts/build-scenes.mjs
```

`animateFrom: true` nghĩa là animate chính `image` của scene; muốn chỉ ảnh khác
thì ghi thẳng đường dẫn (`"animateFrom": "images/abc.jpg"`).

**Prompt animate khác prompt sinh ảnh.** Phong cách, bảng màu và bố cục đã nằm
trong ảnh nguồn rồi, nhồi lại cả công thức Mục 3 chỉ khiến model vẽ lại từ đầu.
Nên với `animate`, cầu nối chỉ gửi mô tả chuyển động (`videoMotion`) cộng một
neo giữ phong cách — `palette` và `composition` của scene bị **bỏ qua** (chúng
vẫn dùng cho job sinh ảnh của scene đó).

**Cần sidecar.** Đây là sinh video nên bắt buộc chạy `pixelle-sidecar.py` (mục 4).

**Ảnh nguồn phải nằm trên máy chạy Pixelle.** Cầu nối gửi đường dẫn tuyệt đối
tới file trong `public/`; nếu Pixelle chạy ở máy/container khác thì copy ảnh
sang đó trước, nếu không sidecar sẽ báo lỗi 400 kèm đường dẫn nó không tìm thấy.

**Sau khi sinh xong, `image` bị xoá khỏi scene** và đường dẫn ảnh nguồn được ghi
cố định vào `animateFrom`. Lý do: `build-scenes.mjs` ưu tiên `image` hơn `video`,
giữ cả hai đồng nghĩa clip vừa sinh không bao giờ được render. Ảnh không mất —
nó vẫn nằm trong `public/images/` và được `animateFrom` trỏ tới, nên `--force`
lúc nào cũng animate lại được.

### Clip ngắn hơn scene

Model i2v thường chỉ ra clip ~5s, trong khi scene dài bằng lời thoại (10–20s).
`build-scenes.mjs` tự đo độ dài clip thật và báo tỉ lệ; `fitToScene` quyết định
cách lấp phần còn thiếu:

| `fitToScene` | Kết quả |
|---|---|
| `loop` (mặc định) | lặp lại clip cho hết scene — an toàn nhất, đổi lại có điểm nối |
| `slow` | giảm tốc độ phát cho vừa đúng scene; dưới ~0.3x dễ giật, script sẽ cảnh báo |
| `freeze` | phát 1 lần rồi đứng ở frame cuối |

Ví dụ log khi clip 4.1s nằm trong scene 18.4s:

```
• scene-01-hook: clip 4.1s ngắn hơn scene 18.4s — sẽ lặp 4.5 lần
```

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
