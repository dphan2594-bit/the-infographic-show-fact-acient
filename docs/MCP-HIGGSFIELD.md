# Higgsfield MCP — sinh ảnh & video AI cho pipeline

[Higgsfield](https://higgsfield.ai) cung cấp một **MCP server host sẵn** (remote) cho phép
Claude (web / desktop / mobile / **Claude Code**) gọi trực tiếp các model sinh ảnh và video
AI ngay trong hội thoại. Trong dự án này, Higgsfield MCP đóng vai trò **nguồn tạo asset**:
ảnh nền AI (`public/images/`) và clip animate như Kling (`public/videos/`) mà lớp hậu kỳ
Remotion sẽ ghép lại — thay cho việc phải sinh ảnh/video ở một công cụ ngoài rồi tải về thủ công.

- Endpoint MCP: `https://mcp.higgsfield.ai/mcp` (transport HTTP)
- Xác thực: **OAuth qua tài khoản Higgsfield — không cần API key**
- Hơn 30 model ảnh/video, output tới 4K, clip tới ~15s, mọi tỉ lệ khung hình

> Higgsfield tính **credit** theo mỗi lần sinh (video đắt hơn ảnh nhiều). Xem [Credit &
> chi phí](#credit--chi-phí) trước khi render hàng loạt.

## 1. Cài đặt vào Claude Code

Chạy một lần (scope `user` để dùng chung cho mọi project):

```console
claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp
```

Lần gọi tool đầu tiên sẽ mở luồng **OAuth trong trình duyệt**: đăng nhập Higgsfield và
approve. Sau đó các tool sinh ảnh/video xuất hiện trong Claude Code (khởi động lại nếu
chưa thấy). Không cần dán API key hay token vào repo.

Kiểm tra kết nối:

```console
claude mcp list
```

> **Không commit** token/credential Higgsfield vào repo. OAuth được Claude Code lưu ngoài
> cây mã nguồn; không có secret nào cần đặt trong `.env` hay `content/manifest.json`.

## 2. Các tool chính

| Tool | Công dụng |
|---|---|
| `generate_image` | Sinh ảnh từ text prompt trên 16+ model, kèm tham chiếu/kích thước |
| `generate_video` | Sinh clip từ text hoặc từ ảnh (image-to-video), tới ~15s |
| `create_character` | Train một "nhân vật" tái sử dụng từ ảnh tham chiếu (giữ nhất quán khuôn mặt/nhân vật giữa nhiều scene) |
| `list_characters` | Liệt kê các nhân vật đã lưu |
| `get_generation_status` | Poll tiến độ job sinh ảnh/video, trả URL kết quả khi xong |

> Tên tool có thể hiển thị kèm prefix server (vd `higgsfield__generate_image`) tùy client.
> Video sinh **bất đồng bộ**: `generate_video` trả về job id, dùng `get_generation_status`
> để chờ tới khi có URL tải về.

## 3. Model gợi ý cho dự án

- **Ảnh tĩnh (E1–E10, nền, chart):** các model ảnh như *Soul*, *Nano Banana*. Ưu tiên
  phong cách "Flat Vector Explainer" theo [`SKILL-FLAT-EXPLAINER.md`](SKILL-FLAT-EXPLAINER.md).
- **Clip animate (scene `motion: "animate"`):** *Kling 3.0* (khớp với ghi chú "Kling" trong
  README), hoặc *Veo 3.1*, *Sora 2*, *Seedance* — dùng image-to-video từ chính ảnh tĩnh đã
  sinh để giữ nhất quán bố cục.

## 4. Quy trình ghép vào pipeline

Higgsfield chỉ tạo ra **file asset**; phần khớp thời lượng / overlay / motion graphics vẫn do
Remotion + `build-scenes.mjs` lo (xem [README](../README.md)). Luồng đầy đủ:

1. **Sinh asset qua MCP.** Trong Claude Code, yêu cầu sinh ảnh/clip cho từng scene. Ví dụ:

   > "Dùng `generate_image` tạo ảnh Flat Vector Explainer 16:9: một kỹ sư Ai Cập cổ đứng cạnh
   > khối đá, phong cách phẳng tối giản, **không có chữ trong ảnh**, palette đất/xanh."

   Với clip animate:

   > "Dùng `generate_video` (Kling 3.0), image-to-video từ ảnh vừa tạo, 5 giây, giữ nguyên bố cục."

2. **Lưu đúng thư mục.** Tải kết quả về:
   - Ảnh → `public/images/scene-XX-ten.png` (hoặc `.jpg`)
   - Clip → `public/videos/scene-XX-ten.mp4`

3. **Khai báo trong manifest.** Thêm entry vào `content/manifest.json`, trỏ `image` (hoặc dùng
   `background.type: "video"` khi khai báo scene thủ công) tới file vừa lưu — đúng format trong
   [`content/manifest.example.json`](../content/manifest.example.json) và `src/scenes/types.ts`.

4. **Build & preview.**
   ```console
   npm run build:scenes   # đo audio, sinh src/scenes/generated.ts
   npm run dev            # xem preview
   ```

## 5. Mẹo prompt khớp style guide

- **Tỉ lệ 16:9 / 1920×1080** — composition render ở tỉ lệ này; yêu cầu Higgsfield xuất
  landscape 16:9 để không bị crop hụt.
- **"Ảnh sạch chữ"** — với ảnh nhân vật/bối cảnh, yêu cầu *không* render chữ trong ảnh; chữ
  tiếng Việt do Remotion overlay (Mục 2 style guide). Ngoại lệ: chart/bản đồ đã có số liệu in
  sẵn — khi đó dùng `fit: "contain"` + `captionBar` (xem entry `finished-chart-example` trong manifest).
- **Nhất quán nhân vật** — nếu một nhân vật xuất hiện ở nhiều scene, `create_character` một lần
  rồi tái dùng để giữ khuôn mặt/trang phục đồng nhất.
- **Bám archetype E1–E10** — mô tả rõ loại cảnh (wide shot hook, character scene, close-up,
  chapter card…) theo [`SKILL-FLAT-EXPLAINER.md`](SKILL-FLAT-EXPLAINER.md).

## 6. Credit & chi phí

- Mỗi lần sinh tiêu **credit**; **video tốn nhiều hơn ảnh đáng kể**.
- Chốt bố cục bằng ảnh tĩnh trước, chỉ chuyển sang `generate_video` cho những scene thật sự
  cần animate (`motion: "animate"`).
- Có thể hỏi Claude poll `get_generation_status` thay vì sinh lại nhiều lần khi chờ kết quả.

## Nguồn

- Higgsfield MCP: <https://higgsfield.ai/mcp>
- Hướng dẫn setup Claude Code: <https://techsy.io/en/blog/higgsfield-mcp-claude-code>
- Tổng quan connector: <https://mcp.film/mcps/higgsfield/>
- Claude Code MCP docs: <https://code.claude.com/docs/en/mcp>
