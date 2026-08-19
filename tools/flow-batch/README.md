# Flow Batch — xưởng prompt hàng loạt cho điện thoại

Một file HTML duy nhất (`index.html`), không cần cài đặt, không server, không build.
Mở bằng trình duyệt điện thoại là dùng được. Toàn bộ dữ liệu nằm trong
`localStorage` của máy bạn.

Tool sinh prompt theo đúng công thức trong
[`docs/SKILL-FLAT-EXPLAINER.md`](../../docs/SKILL-FLAT-EXPLAINER.md) (archetype
E1–E10, Depletion Curve, Pie Chart, bảng màu Mục 5, luật "không sinh chữ bằng AI"),
rồi đẩy cả loạt prompt đó qua Google Flow hoặc qua API ảnh của Google.

## Nói thẳng về giới hạn của Google Flow

Flow **không có API công khai**, và việc dùng script điều khiển giao diện Flow là
trái điều khoản sử dụng — nhất là trên điện thoại thì càng không chạy được. Nên
"tự động hoàn toàn trên Flow" là điều không tool nào làm thật được.

Vì vậy tool chia làm hai đường:

| Đường | Mức tự động | Dùng khi |
|---|---|---|
| **Hàng loạt** (tab 2) | Mỗi cảnh một chạm: chép prompt + mở Flow, đánh dấu xong, tự nhảy cảnh kế | Bạn muốn ảnh sinh bằng Flow / ImageFX / Whisk |
| **Tự động** (tab 3) | Thật sự chạy hết hàng đợi không cần bạn chạm | Bạn có API key Google AI Studio |

Phần nặng nhọc thật sự — viết prompt đúng style, đánh số, đặt tên file khớp
manifest, nhớ cảnh nào đã làm — được tool lo hết ở cả hai đường.

## Mở trên điện thoại

Chọn một trong ba cách:

1. **GitHub Pages** — bật Pages cho repo (Settings → Pages → Deploy from branch),
   rồi vào `https://<user>.github.io/<repo>/tools/flow-batch/`. Cách này bền nhất
   và là cách duy nhất mà nút tải ảnh trong tab "Tự động" chạy đủ.
2. **Tải file về máy** — lưu `index.html` vào Files/Drive rồi mở bằng trình duyệt.
   Chép prompt vẫn chạy; gọi API cần trang chạy qua `https://` nên hãy dùng cách 1.
3. **Chạy tại máy** — `npx http-server . -p 8123` rồi mở
   `http://localhost:8123/tools/flow-batch/`.

## Quy trình gợi ý

1. **Nạp kịch bản** (tab *Tạo prompt*): dán `content/manifest.json` sẵn có, hoặc
   danh sách nhanh mỗi dòng một cảnh:
   ```
   id | archetype | mô tả tiếng Anh | tông màu
   hook | E6 | the Giza pyramid plateau at dawn | Cổ đại
   chapter-1 | E3 | empty title plate | Tiêu đề chương
   builders | E1 | workers dragging a stone block | Trung tính
   ```
   Mô tả nên viết tiếng Anh — model ảnh hiểu tiếng Anh tốt hơn hẳn. Cảnh nạp từ
   manifest sẽ bị đánh dấu "thiếu mô tả", bổ sung bằng nút *Sửa cảnh này*.
2. **Chạy hàng loạt** (tab *Hàng loạt*): thanh dưới cùng có *Chép + mở Flow* →
   dán vào Flow → sinh ảnh → quay lại bấm *Xong ✓*, tool tự nhảy sang cảnh kế.
   Tải ảnh về, đặt tên đúng như dòng `images/scene-XX-<id>.png` hiển thị trên thẻ.
3. **Hoặc chạy tự động** (tab *Tự động*): dán API key từ
   [Google AI Studio](https://aistudio.google.com/apikey), giữ hoặc đổi tên model
   (mặc định `gemini-2.5-flash-image`; điền `imagen-4.0-generate-001` để đi đường
   Imagen), bấm *Chạy toàn bộ cảnh chưa xong*. Ảnh hiện dạng thumbnail, chạm để
   tải về đúng tên file.
4. **Ráp lại vào Remotion** (tab *Xuất*): nút *Chép manifest.json* sinh sẵn mảng
   scene với field `image` đã đánh số khớp tên file. Dán vào `content/manifest.json`,
   thêm `audio`/`caption`, rồi:
   ```console
   npm run build:scenes
   ```

## Quota của chế độ Tự động

Các model sinh ảnh của Gemini API (`gemini-3.1-flash-image`, `gemini-3-pro-image`,
`gemini-2.5-flash-image`…) **không có hạn mức miễn phí**. Key free tier vẫn gọi được
model chữ bình thường, nhưng gọi model ảnh sẽ trả về `429 RESOURCE_EXHAUSTED` với
quota bằng 0. Muốn dùng tab Tự động thì phải bật thanh toán cho project của key tại
[aistudio.google.com/apikey](https://aistudio.google.com/apikey).

Nút **Kiểm tra key** trong tab Tự động gọi ListModels để cho biết key còn sống không
và key thấy những model ảnh nào — chẩn đoán trước khi chạy cả loạt. Chưa bật thanh
toán thì tab **Hàng loạt** qua Flow vẫn dùng được bình thường và không tốn gì.

## Vài điều đáng biết

- **API key** chỉ nằm trong `localStorage` của máy bạn và chỉ được gửi tới
  `generativelanguage.googleapis.com`. Không có backend nào của tool.
- **Ảnh sinh ở tab Tự động chỉ giữ trong bộ nhớ phiên** — tải về trước khi đóng tab.
- Tool tự thử lại một lần không kèm `imageConfig` nếu model chưa nhận tham số tỷ lệ,
  nên vẫn chạy được với các model ảnh đời cũ.
- Giữa các lần gọi có nghỉ ~0.9 giây để tránh chạm rate limit; gặp lỗi API thì
  dừng ngay và in nguyên văn lỗi, không âm thầm bỏ qua cảnh.
- Tên file luôn theo thứ tự hàng đợi: đổi thứ tự cảnh thì số thứ tự đổi theo.
