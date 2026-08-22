# Dựng hàng loạt 50–60 cảnh

Quy trình để đưa một loạt ảnh + lời thoại + mô tả animation thành 2 bản video
(dọc 9:16 và ngang 16:9), render được nhiều lần, hỏng giữa chừng chạy lại không
mất công.

---

## 1. Bạn chuẩn bị gì

| Thứ | Nơi đặt | Ghi chú |
|---|---|---|
| Ảnh cảnh | `public/images/` | PNG/JPG/WebP. Đặt tên theo thứ tự: `scene-01-hook.png`, `scene-02-...` |
| Audio TTS | `public/audio/` | Mỗi cảnh 1 file. Thời lượng cảnh **tự tính** theo file này |
| Mô tả từng cảnh | 1 file text/CSV/Markdown | Xem mẫu ở mục 2 |

Push thẳng lên nhánh làm việc là nhanh nhất:

```console
git add public/images public/audio content/
git commit -m "Add scene assets"
git push
```

**Dung lượng:** 55 ảnh PNG ~2 MB/ảnh = ~110 MB trong git. Nếu ảnh không cần
trong suốt, xuất JPG chất lượng 90 (~300 KB/ảnh) là đủ cho video và nhẹ hơn 6 lần.

---

## 2. Mô tả cảnh bằng tiếng Việt

Viết mỗi cảnh một dòng, không cần biết cú pháp JSON — chuyển sang manifest là
việc của bước 3:

```
01 | scene-01-hook.png | scene-01.mp3 | "Vũ trụ rộng cỡ nào?" | đẩy vào chậm nhắm vào mặt trời ở giữa trên, thêm sao nhấp nháy + bụi
02 | scene-02-chart.png | scene-02.mp3 | "93 tỷ năm ánh sáng." | giữ gần như tĩnh vì nhiều chữ, chỉ trôi nhẹ
03 | scene-03-ship.png | scene-03.mp3 | "Tàu Voyager mất 40 năm..." | lia sang phải theo con tàu ở góc phải dưới, có luồng phản lực
```

Càng nói rõ **điểm nhấn nằm ở đâu trong ảnh** (trái/phải, trên/dưới) thì camera
càng nhắm đúng — đó là thông tin duy nhất không đoán được từ file ảnh.

---

## 3. Manifest

`content/manifest.json` là mảng, mỗi phần tử một cảnh:

```json
{
  "id": "scene-01-hook",
  "image": "images/scene-01-hook.png",
  "audio": "audio/scene-01.mp3",
  "caption": "Vũ trụ rộng cỡ nào?",
  "captionEntrance": "rise-float",
  "camera": { "preset": "push-in", "focusX": 50, "focusY": 34 },
  "cameraVertical": { "preset": "push-in-fast", "focusX": 50, "focusY": 40, "intensity": 1.2 },
  "fx": ["stars", "dust", { "type": "glow", "x": 50, "y": 34, "radius": 210 }],
  "transitionIn": { "type": "fade" }
}
```

### Camera

`"camera": "push-in"` là dạng rút gọn của `{ "preset": "push-in" }`.

| Preset | Chuyển động |
|---|---|
| `hold` | Gần như đứng yên — cảnh nhiều chữ |
| `drift` | Không đẩy, chỉ trôi bồng bềnh |
| `push-in` | Đẩy vào chậm, đều (mặc định an toàn) |
| `push-in-fast` | Đẩy nhanh, dứt khoát — hook, cú nhấn |
| `pull-back` | Cận → lùi ra toàn cảnh |
| `reveal` | Cận → lùi ra → đẩy nhẹ lại (ba nhịp) |
| `pan-left` / `pan-right` | Lia ngang ở zoom vừa |
| `tilt-up` / `tilt-down` | Hất lên / chúc xuống |
| `punch-in` | Giữ yên rồi nhấn một phát giữa cảnh |
| `sweep` | Vừa đẩy vừa lia chéo |
| `orbit-drift` | Zoom vừa, trôi vòng rộng — cảnh nền, cảnh vũ trụ |

Tuỳ chọn kèm theo: `focusX`/`focusY` (điểm cần nhắm, % khung), `intensity`
(1 = mặc định, 1.5 = mạnh hơn, 0.5 = nhẹ đi), `driftPercent`, `driftSeconds`.

`cameraVertical` / `cameraWide` ghi đè `camera` cho riêng bản dọc / bản ngang —
cần dùng khi ảnh ngang bị crop mạnh ở khung dọc.

Muốn kiểm soát tuyệt đối thì bỏ preset và viết thẳng keyframe:

```json
"camera": {
  "keyframes": [
    { "at": 0,   "zoom": 1.26, "focusX": 47, "focusY": 40 },
    { "at": 100, "zoom": 1.05, "focusX": 61, "focusY": 57 }
  ],
  "driftPercent": 0.5
}
```

### fx

Rút gọn: `"stars"` (sao nhấp nháy), `"dust"` (bụi màu trôi, tạo parallax),
`"meteors"` (sao băng). Cần tham số thì viết object:

```json
"fx": [
  { "type": "glow", "x": 46, "y": 38, "radius": 210, "color": "#FFF0B0", "periodSeconds": 3.6 },
  { "type": "engineTrail", "x": 80, "y": 72, "angleDeg": 33, "length": 22 },
  { "type": "orbitSystem", "x": 46, "y": 38, "showCore": false, "rings": [{ "radius": 117, "showRing": false }] }
]
```

Mỗi fx tự nhận `seed` theo `id` của cảnh nên hai cảnh không bao giờ trùng cách
rải sao/hạt.

---

## 4. Build + preview

```console
npm run build:scenes     # manifest + audio → src/scenes/generated.ts + content/scenes.json
npm run lint             # tsc bắt lỗi tên preset/fx sai ngay tại đây
npm run dev              # Remotion Studio: xem Infographic (dọc) và InfographicWide (ngang)
```

Sai tên preset (`"push-inn"`) hay thiếu file audio đều báo lỗi ngay ở bước
`build:scenes`, không phải đợi render xong mới biết.

---

## 5. Render

```console
npm run render:batch                                  # bản dọc  → out/Infographic.mp4
npm run render:batch -- --comp=InfographicWide        # bản ngang → out/InfographicWide.mp4
```

Cơ chế: chia timeline thành từng chunk 900 frame (30 giây), render lần lượt,
**bỏ qua chunk đã có sẵn**, cuối cùng ghép bằng `ffmpeg -c copy` (chỉ remux,
không encode lại nên không giảm chất lượng và mất vài giây).

- Máy chết giữa chừng → chạy lại đúng lệnh đó, nó tiếp tục từ chunk dang dở.
- Sửa 1 cảnh → xoá các chunk chứa cảnh đó trong `out/chunks/<comp>/` rồi chạy lại.
- Render lại toàn bộ: thêm `--force`.
- Đổi kích thước chunk: `--chunk=600`.

Yêu cầu: **ffmpeg** trong PATH (Ubuntu `apt-get install -y ffmpeg`, macOS
`brew install ffmpeg`). Remotion không cần ffmpeg để render, chỉ bước ghép cần.

### Thời gian render (đo thật trên máy 4 nhân)

| Loại cảnh | Tốc độ |
|---|---|
| Ảnh tĩnh + camera + caption | ~4,8 frame/giây |
| Ảnh + nhiều hiệu ứng hạt (bụi, sao băng, quỹ đạo) | ~2,8 frame/giây |

Suy ra cho **55 cảnh × 8 giây = 13.200 frame**:

- Bản dọc: **45–80 phút** tuỳ độ nặng hiệu ứng
- Cả hai bản: **1,5–2,5 giờ**

Máy nhiều nhân hơn thì nhanh gần như tuyến tính (`--concurrency` mặc định theo
số nhân). Đây là lý do pipeline chia chunk: không ai muốn mất 80 phút vì một lần
treo máy ở phút thứ 75.
