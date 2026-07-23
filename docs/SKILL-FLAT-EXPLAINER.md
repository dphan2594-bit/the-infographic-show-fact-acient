# SKILL-FLAT-EXPLAINER.md
## Hệ thống prompt AI ảnh tĩnh — Phong cách "Flat Vector Explainer" (tham chiếu: The Infographics Show)

**Mục đích:** Sinh ảnh tĩnh minh họa phong cách flat vector kiểu kênh giải thích (explainer) như The Infographics Show, dùng làm khung hình cho video finance/whiteboard (kết hợp Ken Burns effect + voiceover), KHÔNG phải animation vector thật (After Effects rig).

-----

## 0. CHIẾN LƯỢC HÌNH ẢNH HÓA NỘI DUNG (Visual Funnel & Dịch Mã) — nền tảng trước khi áp dụng archetype

**Nguồn:** phân tích chiến lược nội dung The Infographics Show (15.5M subscriber, 6.2K video). Đây là tầng **chiến lược** đứng trên các archetype kỹ thuật (E1-E10) — quyết định NÊN dùng archetype nào, không chỉ vẽ đẹp ra sao.

### Công thức cốt lõi

> **Dữ liệu phức tạp + Cấu trúc Infographic × Câu chuyện hóa = Cảm giác giác ngộ**

Không có dữ liệu nào "nhàm chán" — chỉ có dữ liệu **chưa tìm ra đúng cấu trúc thị giác** (Timeline, Matrix, Flowchart, Depletion Curve...). Nhiệm vụ trước khi viết prompt ảnh là xác định đúng cấu trúc, không phải làm ảnh đẹp hơn.

### Phễu Thị Giác (Visual Funnel) — áp dụng cho MỌI kịch bản trước khi generate ảnh

```
Tầng 1 — KÍCH THÍCH
  Tiêu đề/hook tạo tò mò cực độ (thường dạng câu hỏi cực đoan,
  "Điều gì xảy ra nếu...")
Tầng 2 — LỜI HỨA THỊ GIÁC
  Khán giả kỳ vọng ĐƯỢC NHÌN THẤY cơ chế hoạt động, không chỉ nghe kể
  → Đây là bước hay bị bỏ qua nhất khi chỉ có giọng đọc + ảnh minh hoạ
    hời hợt
Tầng 3 — THỎA MÃN
  Thực thi bằng hình ảnh/animation phân tách từng lớp, đúng với lời
  hứa đã đưa ra ở Tầng 1
```

> **Nguyên tắc cốt lõi:** "Khán giả click không phải để biết kết quả, họ click để được nhìn thấy cơ chế hoạt động."

**Checklist bắt buộc trước khi breakdown scene:**

```
□ Hook/câu thoại đang hứa hẹn cho khán giả NHÌN THẤY cụ thể điều gì?
□ Archetype nào (E1-E10) thực sự trả được lời hứa đó — hay chỉ đang
  minh hoạ chung chung, không "mở khoá" cơ chế như lời hứa?
□ Nếu script có câu kiểu "nghe thật chậm nhé" / "để mình giải thích
  cơ chế" → đây LÀ tín hiệu Tầng 2, bắt buộc phải có hình ảnh phân
  tách từng bước tương ứng, không chỉ hình MC nói chuyện
```

### Bảng Dịch Mã — loại nội dung → cấu trúc thị giác tương ứng (mở rộng cho kênh tài chính)

| Loại nội dung | Cấu trúc thị giác | Archetype tương ứng |
|---|---|---|
| Lịch sử / mốc thời gian / sự kiện | Timeline + tái tạo không gian | E6 + Date/Year HUD (Mục 4.1) |
| Quy trình vật lý / luồng tiền / các bước ra quyết định | Sơ đồ lưu đồ nhân quả (A→B→C) | E8 Process Flow (Mục 4.1) |
| Quá trình tâm lý/cảm xúc vô hình (vòng lặp xấu hổ, cortisol-dopamine, FOMO...) | Bản đồ hóa quy trình: phân mảnh khái niệm trừu tượng thành các bước theo thời gian, icon hoá trung tính | **E10 — MỚI, xem bên dưới** |
| Tỷ lệ / thống kê so sánh | Bar chart / Pie chart | E2 mở rộng (Mục 4.1) |
| Trải nghiệm cạn kiệt / sinh tồn / căng thẳng kéo dài | Biểu đồ cạn kiệt (đường cong depletion + dao động tâm lý) | **Depletion Curve — MỚI, xem bên dưới** |

### E10 — Bản Đồ Hoá Quy Trình Tâm Lý/Trừu Tượng (Psychological Process Map)

Dùng riêng cho nội dung tâm lý/cảm xúc vô hình — ví dụ đúng trường hợp "vòng lặp xấu hổ tài chính" (nhìn tài khoản → xấu hổ → cortisol tăng → dopamine tìm lối thoát → nói dối → nợ tăng → lặp lại, tệ hơn) trong kịch bản podcast. Đây là nhánh phong cách **kỹ thuật/blueprint**, khác hẳn flat vector nhân vật — chỉ dùng cho đoạn "giải mã cơ chế", KHÔNG dùng cho scene có MC.

```
Clean technical schematic illustration, wireframe human head/silhouette
outline, connected circular nodes representing sequential steps inside,
thin directional arrows between nodes, neutral medical-style icons
(flat heart rate line, neutral symbols) instead of graphic/bloody
imagery, blueprint/engineering diagram aesthetic, muted monochrome or
duotone palette with one accent color, precise thin linework, labeled
callout boxes with leader lines (empty placeholders), no text, no
watermark
```

**Nguyên tắc quan trọng khi dùng E10:** giữ icon trung tính, giáo dục — tránh hình ảnh gây sợ hãi/tiêu cực quá mức (ví dụ không vẽ mặt đau khổ cường điệu), vì mục đích là **giải thích cơ chế**, không phải gây sốc.

### Depletion Curve (Biểu đồ cạn kiệt) — MỚI

Dùng cho nội dung mô tả trạng thái căng thẳng/cạn kiệt kéo dài rồi dao động — ví dụ minh hoạ mức cortisol/lo lắng nền tăng giảm qua thời gian trong kịch bản tâm lý tài chính.

```
Clean technical line chart, single curve declining then showing
irregular oscillation pattern, labeled axis with placeholder text
areas, small square data-point markers along the curve, blueprint
diagram style, thin precise linework, muted palette with one accent
color, no text, no watermark
```

### Định hướng chọn chủ đề (tham khảo, không phải archetype hình ảnh)

4 dạng chủ đề khai thác tâm lý tò mò hiệu quả nhất theo phân tích kênh gốc — có thể mượn tinh thần cho kênh tài chính:

- **Trải nghiệm cơ thể/giác quan** → có thể chuyển thành "trải nghiệm cảm xúc tài chính" (cảm giác nợ nần, cảm giác tự do tài chính)
- **Câu hỏi giả định cực đoan** → ví dụ "Điều gì xảy ra nếu bạn không bao giờ đầu tư?"
- **Lịch sử đen tối/bí ẩn** → ví dụ những sự thật ít ai nói về nợ, phá sản
- **Sinh tồn kỳ tích** → khớp trực tiếp với câu chuyện thật của MC (công nhân tự học đầu tư từ số 0)

-----

## 1. NHẬN DẠNG PHONG CÁCH GỐC

Quan sát từ video "Economy is Booming… Why You Will Never Feel Rich Again" (@TheInfographicsShow):

- **Nhân vật**: hình khối phẳng (flat shading), không gradient phức tạp, tỉ lệ hơi cách điệu (đầu to, thân đơn giản), khuôn mặt tối giản (chấm mắt, nét miệng đơn)
- **Icon badge tròn**: khái niệm trừu tượng → icon nằm trong khung tròn viền trắng dày, label chữ hoa bên dưới (vd: giỏ hàng = "GROCERIES", trái tim = "HEALTH INSURANCE")
- **Bảng màu**: mỗi cảnh chỉ 2–4 màu chủ đạo, độ bão hòa cao, tương phản rõ (tím-be, xanh dương-cam, be-đỏ)
- **Chapter card**: chữ trắng 3D lớn kiểu "CHAPTER X:" trên nền màu đơn sắc + họa tiết hình học lặp (dấu cộng, đường chéo) mờ phía sau
- **Cận cảnh vật/tay**: dùng vật thể phóng to (tay cầm hồ sơ, tủ safe mở) chiếm 1/3–1/2 khung để tạo chiều sâu bố cục
- **Bối cảnh nội thất đơn giản hóa**: phòng làm việc, giảng đường — vẽ bằng khối hình học cơ bản, không chi tiết vân gỗ/texture thật

-----

## 2. NGUYÊN TẮC QUAN TRỌNG: CHỮ KHÔNG DO AI SINH

AI image gen (Midjourney/Ideogram/GPT-image) sinh chữ tiếng Việt có dấu **rất kém**. Với style này chữ overlay là phần cốt lõi (label icon, chapter title, số liệu).

→ **Luôn sinh ảnh KHÔNG chữ**, rồi chèn chữ tiếng Việt bằng Canva/CapCut/After Effects ở bước hậu kỳ. Không cố ép AI viết chữ vào prompt.

-----

## 3. CÔNG THỨC PROMPT CHUNG

```
Flat vector illustration, [character/object description], 
[color 1] and [color 2] flat color palette, minimal geometric shapes, 
bold clean outlines, no gradients, no texture, corporate explainer video style, 
simple facial features, high contrast, clean vector art, 
2D flat design, [composition note], no text, no watermark
```

**Negative prompt gợi ý:** `3D render, photorealistic, watercolor, painterly texture, gradient shading, complex background detail, text, watermark, logo`

-----

## 4. CÁC ARCHETYPE CẢNH (E1–E6, xem thêm E8–E9 mở rộng ở Mục 4.1)

### E1 — Character Scene (nhân vật hành động)

Nhân vật flat vector trong bối cảnh đơn giản, thể hiện cảm xúc/hành động liên quan nội dung (ngồi làm việc, cầm hồ sơ, đứng trước bảng đen…).

```
Flat vector illustration of a [tired/worried/confident] [office worker/factory worker], 
[action, e.g. sitting at desk with laptop], muted [color] and [accent color] palette, 
simple flat shading, minimal face detail, clean geometric background, 
2D corporate explainer style, no text
```

### E2 — Icon Badge Concept (khái niệm trừu tượng → icon tròn)

```
Flat vector icon of [object, e.g. house/heart/graduation cap] inside a white-bordered circle badge, 
[background color] background, bold flat colors, minimal detail, clean vector icon style, 
centered composition, no text, no gradient
```

Dùng khi cần minh họa 1 khái niệm đơn (chi phí, bảo hiểm, giáo dục…) — ghép nhiều icon thành lưới ở bước dựng video.

### E3 — Chapter/Section Title Card

```
Bold 3D white lettering placeholder shape on [solid color] background, 
repeating geometric pattern (plus signs, diagonal lines) faded in background, 
flat design, high contrast, no readable text, clean vector style
```

Lưu ý: sinh nền + hiệu ứng chữ 3D giả (khối trắng) rồi thay chữ thật trong CapCut/AE.

### E4 — Close-up Object Focus

Vật thể/tay phóng to chiếm góc khung để tạo chiều sâu.

```
Flat vector illustration, close-up of [hand holding folder / open safe with money], 
[skin tone] flat-shaded hand, [color] object, simple background blur suggestion, 
2D corporate explainer style, bold clean lines, no text
```

### E5 — Comparison/Basket Grid

Nhiều icon badge cùng loại xếp lưới để so sánh (dùng ghép ảnh, không cần AI sinh 1 lần).

Sinh từng icon riêng theo E2, ghép lưới ở Canva/AE để kiểm soát bố cục và chèn label chính xác.

### E6 — Environment Wide Shot

Bối cảnh rộng (giảng đường, văn phòng, phố) làm nền cho nhân vật nhỏ hoặc mở đầu video.

```
Flat vector wide shot of [location, e.g. lecture hall / city street], 
simplified geometric architecture, [2-3 color] palette, small flat-shaded characters, 
clean 2D explainer background art, no text
```

-----

## 4.1 ARCHETYPE MỞ RỘNG (E8–E9) — bổ sung từ phân tích thêm ảnh tham chiếu kênh gốc

**Nguồn:** phân tích 8 khung hình thực tế từ The Infographics Show (các video về nợ công Mỹ, petrodollar, SWIFT...). Đây là các pattern có giá trị áp dụng trực tiếp cho nội dung tài chính, chưa có trong E1-E6.

### E8 — Process Flow Diagram (Sơ đồ luồng quy trình)

Chuỗi các ô/icon nối bằng mũi tên, thể hiện dòng chảy tiền/thông tin/quy trình qua nhiều bước, có nhãn thời gian hoặc chi phí ở từng bước. Rất hợp để minh hoạ: luồng tiền khi mua ETF, quy trình chuyển khoản, dòng vốn đầu tư, các bước ra quyết định.

```
Flat vector illustration, horizontal process flow diagram, [3-5] simple
icon boxes connected by arrows showing [PROCESS STEPS, e.g. sender icon
→ bank icon → intermediary bank icon → recipient bank icon → recipient
icon], small label placeholders above each arrow for time/fee, [COLOR]
monochrome or duotone palette, clean geometric icons, bold outlines,
high contrast, 2D flat design, no text, no watermark
```

**Lưu ý:** Icon và mũi tên sinh không chữ — nhãn thời gian/chi phí ("1-4 ngày", "phí giao dịch") chèn ở hậu kỳ như mọi archetype khác.

### E9 — Data Callout Badge (Nhãn số liệu nổi có đường nối)

Một huy hiệu số liệu (số phần trăm, con số lớn) nổi lên trên cảnh chính, nối bằng 1 đường thẳng/cong đến đúng vị trí liên quan trong khung hình — khác với badge độc lập kiểu E2, ở đây badge **đè lên và chú thích trực tiếp** vào 1 cảnh đang diễn ra.

```
Flat vector illustration, [MAIN SCENE DESCRIPTION], with a floating
circular data badge overlay in the corner showing a large empty number
placeholder shape, thin callout line connecting the badge to the
relevant object in the scene, [COLOR] accent circle with contrasting
text-placeholder area, bold outlines, high contrast, 2D flat design,
no text, no watermark
```

**Dùng khi:** cần nhấn 1 con số quan trọng ngay trong bối cảnh đang diễn ra (ví dụ "-40%" đè lên cảnh cổ phiếu rơi, thay vì để badge số liệu tách rời như E2).

### Ghi chú bổ sung — 2 kỹ thuật không cần archetype riêng

**Pie Chart + Icon trung tâm:** biến thể của E2, dùng khi cần thể hiện tỷ lệ/tỷ trọng thay vì 1 khái niệm đơn.

```
Flat vector pie chart, [2] color segments, simple icon centered on the
dividing line, bold flat colors, minimal detail, clean vector style,
no text, no gradient
```

Ứng dụng: tỷ trọng danh mục ETF, phân bổ tài sản.

**Widget mốc thời gian (Date/Year HUD):** khung nhỏ góc trên trái hiển thị mốc năm/ngày khi kể chuyện lịch sử hoặc dòng thời gian — dùng kèm bất kỳ archetype nào (đặc biệt E6 Wide Shot, E8 Process Flow).

```
small rounded rectangle HUD widget, calendar icon, empty year/date
placeholder text area, positioned top-left corner, subtle drop shadow,
flat design, no text
```

Ứng dụng: thay cho cách ghi mốc năm nhỏ hiện tại ở đoạn "dữ liệu lịch sử 2008/2020" — widget này rõ ràng và chuyên nghiệp hơn.

-----

## 5. BẢNG MÀU THAM KHẢO (chọn 1 cặp/cảnh, không trộn quá 4 màu)

|Tâm trạng nội dung           |Cặp màu chủ đạo             |
|-----------------------------|----------------------------|
|Trung tính/giải thích số liệu|Be (#E8DFC8) + Nâu gỗ       |
|Căng thẳng tài chính         |Đỏ nhạt (#E85D5D) + Xám be  |
|Hy vọng/giải pháp            |Xanh lá (#4CAF50) + Vàng cam|
|Tiêu đề chương/quan trọng    |Tím (#6B5CE0) + Trắng       |
|Công sở/số liệu              |Xanh dương (#4A90D9) + Cam  |

-----

## 6. QUY TRÌNH ĐỀ XUẤT CHO KÊNH WHITEBOARD/FINANCE

1. Viết kịch bản → chia thành scene theo 6 archetype trên
1. Sinh ảnh từng scene bằng công thức tương ứng (không chữ)
1. Import vào CapCut/Canva/AE → thêm text overlay tiếng Việt (font bo đậm, chữ hoa, có đổ bóng — giống style gốc)
1. Ghép icon badge thành lưới nếu cần so sánh nhiều khái niệm
1. Phân loại từng scene theo **Mục 8 (Tĩnh vs Animation)** trước khi gửi sang Kling — không mặc định animate toàn bộ
1. Ken Burns nhẹ (zoom/pan chậm) cho các scene tĩnh để tạo cảm giác chuyển động

-----

## 7. GHI CHÚ

- Style này khác hoàn toàn watercolor (SKILL-V5, SKILL-CNDT) và ink editorial (SKILL-CNDT-WHITEBOARD) — nên dùng cho kênh whiteboard/finance như một **hướng đi mới**, không trộn lẫn với 2 style kia trong cùng 1 video.
- Nếu muốn animation thật (nhân vật cử động mượt như bản gốc), cần công cụ vector animation (Vyond, After Effects + rig), không phải AI image gen — đây là quyết định về công cụ, không phải prompt.

-----

## 8. NGUYÊN TẮC TĨNH vs ANIMATION (Hybrid — bổ sung)

**Vấn đề:** Animate toàn bộ scene bằng Kling tốn thời gian/chi phí không cần thiết, đặc biệt với video 10+ phút (50-60 scene). Nhưng tĩnh 100% dễ làm giảm retention ở giữa video dài, nhất là các scene có nhân vật MC nói chuyện xuyên suốt.

**Quy tắc mặc định: ĐA SỐ SCENE LÀ TĨNH.** Chỉ animate (Kling) khi rơi vào 1 trong 3 trường hợp sau:

```
□ TRƯỜNG HỢP 1 — Hook mở đầu (3-15 giây đầu video)
  → Luôn animate, vì đây là điểm quyết định giữ chân người xem cao nhất
□ TRƯỜNG HỢP 2 — Chuyển động khái niệm cốt lõi
  → Chỉ khi ảnh tĩnh KHÔNG đủ truyền tải ý nghĩa nếu thiếu chuyển động
  → Ví dụ: giỏ hàng lấp đầy icon, biểu đồ vẽ rơi/tăng, vật thể biến hình,
    kính lúp di chuyển vào chi tiết
  → Không tính: badge xuất hiện, chữ bay vào, icon trượt vào khung
    (những cái này làm bằng CapCut motion graphics, KHÔNG cần Kling)
□ TRƯỜNG HỢP 3 — Khoảnh khắc cảm xúc mạnh của MC/nhân vật
  → Cảnh báo rủi ro nghiêm túc, chia sẻ trải nghiệm cá nhân, outro
    kêu gọi hành động, khoảnh khắc hoảng loạn/căng thẳng trong câu chuyện
  → KHÔNG áp dụng cho mọi lần MC xuất hiện — chỉ áp dụng ở điểm
    cảm xúc thay đổi rõ rệt, không phải đoạn giải thích thông thường
```

**Tỷ lệ tham khảo:** với video 50-60 scene, mục tiêu animate khoảng **20-25%** tổng số scene (khoảng 12-15 scene/video 55 scene). Nếu vượt quá 30%, cân nhắc lại xem có đang animate cả những đoạn CapCut đã xử lý đủ tốt hay không.

**Kỹ thuật thay thế cho scene tĩnh (không cần Kling nhưng vẫn tạo cảm giác động):**

| Hiệu ứng cần | Làm bằng CapCut/Canva thay vì Kling |
|---|---|
| Icon/badge xuất hiện | Scale-in "pop" |
| So sánh 2 icon song song | Slide-in từ 2 hướng đối xứng |
| Danh sách nhiều icon | Stagger reveal (xuất hiện lần lượt) |
| Chapter card có chữ | Text animation (phóng to/gạch chân động) |
| Ảnh tĩnh thường | Ken Burns (pan/zoom chậm, đổi hướng mỗi 3-5s để tránh đều đều) |
| 1 chi tiết bị mờ đi trong ảnh | Crossfade/opacity animation |

**Checklist áp dụng khi breakdown scene:**

```
□ Đã liệt kê từng scene là STATIC hay ANIMATE trước khi generate ảnh?
□ Mỗi scene ANIMATE có thuộc đúng 1 trong 3 trường hợp ở trên không?
□ Tổng số scene animate có nằm trong khoảng 20-25% không?
□ Các scene STATIC có ghi rõ kỹ thuật CapCut cụ thể (không để trống)?
□ Ken Burns có đổi hướng pan/zoom giữa các scene liên tiếp để
  tránh cảm giác đều đều trong video dài?
```

---

## 9. CÔNG THỨC THUMBNAIL (Archetype E7 — riêng biệt với E1-E6 trong video)

**Phân tích từ thumbnail thực tế kênh The Infographics Show:**

- **Nhân vật cận cảnh** chiếm phần lớn khung, biểu cảm cực kỳ phóng đại (mắt trợn to, mặt đỏ giận dữ, miệng há gào thét, hoặc sốc/kinh ngạc) — không phải biểu cảm điềm tĩnh như trong video
- **1 vật thể/biểu tượng trung tâm** đại diện chủ đề video, đặt cạnh hoặc phía sau nhân vật (paycheck, toà nhà sụp đổ, con mắt giám sát, kim tự tháp...)
- **Nền radial burst** — ánh sáng toả tia từ tâm ra ngoài, hoặc gradient tối kịch tính, tạo cảm giác căng thẳng/khẩn cấp
- **Bảng màu**: chỉ 2-3 màu bão hoà cao, tương phản mạnh (không dùng bảng màu dịu như trong video)
- **Bố cục chừa khoảng trống** ở góc trên (~20% chiều cao khung) để chèn tiêu đề chữ hoa đậm ở hậu kỳ

### Công thức prompt Thumbnail:

```
Flat vector illustration, close-up dramatic portrait of a [SHOCKED/ANGRY/SCREAMING]
[character description], exaggerated wide eyes, intense facial expression,
[CENTRAL SYMBOLIC OBJECT] positioned beside or behind character,
radial burst lighting background in [COLOR 1] and [COLOR 2], high saturation,
bold thick outlines, no gradients on character, high contrast, dramatic
composition, clean vector art, 2D flat design, empty space at top for text,
no text, no watermark
```

**Negative prompt:** giữ nguyên như Mục 3 (`3D render, photorealistic, watercolor, painterly texture, gradient shading, complex background detail, text, watermark, logo`)

### Bảng màu Thumbnail theo tâm trạng (tách riêng, bão hoà cao hơn bảng Mục 5):

| Tâm trạng thumbnail | Cặp màu |
|---|---|
| Phanh phui/bí ẩn bị lộ | Tím đậm (#5B3FD6) + Đen |
| Khủng hoảng/sụp đổ | Đỏ cam rực (#FF4500) + Đen |
| Bí mật/công nghệ giấu kín | Xanh dương đậm (#1A3A5C) + Đen |
| Cảnh báo khẩn cấp | Đỏ (#E85D5D) + Vàng cảnh báo |
| Giải oan/đính chính hiểu lầm | Tím (#6B5CE0) + Trắng (giữ 1 phần sáng để tạo cảm giác "sáng tỏ") |

**Lưu ý quan trọng:** Thumbnail phong cách này thiên về **kịch tính hoá cảm xúc** để tăng CTR — vẫn phải giữ đúng sự thật nội dung video (không thumbnail lừa dối/clickbait sai sự thật), chỉ phóng đại **cách thể hiện cảm xúc**, không phóng đại **nội dung**.

---
---

### VÍ DỤ MINH HOẠ THỰC TẾ — Video "Tại Sao ETF An Toàn Hơn Bạn Nghĩ" (55 scene)

Kết quả áp dụng nguyên tắc trên: **14/55 scene animate (~25%)** — đúng trong khoảng tham khảo, **41/55 scene tĩnh**.

| # | Nội dung scene | Loại | Kỹ thuật cụ thể |
|---|---|---|---|
| 01 | Hook — MC nghiêng người | **🎬 ANIMATE** | Kling: cử chỉ nghiêng người, giao tiếp mắt |
| 02 | MC mở tay liệt kê | **🎬 ANIMATE** | Kling: cử chỉ tay mở |
| 03 | MC suy nghĩ | 🖼️ Static | Ken Burns zoom in chậm |
| 04 | Tay cầm điện thoại | 🖼️ Static | Ken Burns zoom + CapCut: bong bóng chat rung nhẹ |
| 05 | Icon rơi -40% | **🎬 ANIMATE** | Kling: đường biểu đồ vẽ rơi xuống |
| 06 | Nhân vật buồn | 🖼️ Static | Ken Burns zoom vào biểu cảm |
| 07 | Chapter card "canh bạc" | 🖼️ Static | CapCut: chữ phóng to + gạch chân động |
| 08 | MC giới thiệu ETF | 🖼️ Static | Ken Burns pan nhẹ |
| 09 | Giỏ hàng lấp đầy | **🎬 ANIMATE** | Kling: icon bay vào giỏ, giỏ biến hình |
| 10 | Lưới 4 icon (sữa/ngân hàng...) | 🖼️ Static | CapCut: stagger reveal từng icon |
| 11 | MC cầm giỏ trên tay | 🖼️ Static | Ken Burns zoom in |
| 12 | Badge ETF chỉ số | 🖼️ Static | CapCut: slide-in từ trái |
| 13 | Badge ETF ngành | 🖼️ Static | CapCut: slide-in từ phải |
| 14 | MC mời tiếp tục | 🖼️ Static | Ken Burns tĩnh |
| 15 | MC nghiêm túc | 🖼️ Static | Ken Burns zoom vào biểu cảm |
| 16 | Chapter card cảnh báo | 🖼️ Static | CapCut: chữ xuất hiện từng khối |
| 17 | Badge chart thị trường | 🖼️ Static | CapCut: scale-in nhẹ |
| 18 | Công ty nứt vỡ | **🎬 ANIMATE** | Kling: hiệu ứng nứt, rung |
| 19 | Đường rơi về 0 | **🎬 ANIMATE** | Kling: đường vẽ rơi thẳng, dừng đột ngột |
| 20 | Icon ETF mất phần nhỏ | 🖼️ Static | CapCut: crossfade làm mờ 1 icon |
| 21 | MC trấn an | 🖼️ Static | Ken Burns tĩnh |
| 22 | MC dẫn vào dữ liệu | 🖼️ Static | Ken Burns tĩnh |
| 23 | Wide shot sàn giao dịch | 🖼️ Static | Ken Burns pan ngang chậm |
| 24 | Chart tăng dài hạn | **🎬 ANIMATE** | Kling: đường vẽ đi lên sau dip |
| 25 | MC cảnh báo thận trọng | 🖼️ Static | Ken Burns tĩnh |
| 26 | Chapter card "phát triển chung" | 🖼️ Static | CapCut: chữ xuất hiện theo nhịp |
| 27 | MC nhắc Warren Buffett | 🖼️ Static | Ken Burns tĩnh |
| 28 | MC giơ 3 ngón tay | 🖼️ Static | Ken Burns zoom vào tay |
| 29 | Badge rủi ro #1 | 🖼️ Static | CapCut: scale "pop" |
| 30 | Badge rủi ro #2 | 🖼️ Static | CapCut: scale "pop" |
| 31 | Badge rủi ro #3 | 🖼️ Static | CapCut: scale "pop" |
| 32 | MC + đồng hồ cát | 🖼️ Static | Ken Burns tĩnh |
| 33 | MC tâm sự | 🖼️ Static | Ken Burns zoom nhẹ |
| 34 | Nhân vật hoảng loạn bán | **🎬 ANIMATE** | Kling: tay run, biểu cảm hoảng |
| 35 | MC trấn an | 🖼️ Static | Ken Burns tĩnh |
| 36 | So sánh DCA vs dồn 1 lần | 🖼️ Static | CapCut: 2 badge trượt vào song song |
| 37 | MC giải thích DCA | 🖼️ Static | Ken Burns tĩnh |
| 38 | Kính lúp soi giỏ | **🎬 ANIMATE** | Kling: kính lúp di chuyển, phóng to |
| 39 | MC chốt "đọc kỹ" | 🖼️ Static | Ken Burns giữ ngắn |
| 40 | Flashback công nhân gửi tiền về quê | **🎬 ANIMATE** | Kling: biểu cảm trầm ngâm, tay đưa phong bì |
| 41 | Flashback công nhân tự vấn bản thân | **🎬 ANIMATE** | Kling: chuyển động đầu chậm, ánh mắt xa xăm |
| 42 | Tiết kiệm 10% + tìm hiểu đầu tư | 🖼️ Static | Ken Burns zoom nhẹ |
| 43 | Chuyển cảnh về MC hiện tại, chuyển sang ETF | **🎬 ANIMATE** | Kling: chuyển cảnh mượt flashback → hiện tại |
| 44 | MC liệt kê điều kiện | 🖼️ Static | Ken Burns tĩnh |
| 45 | 3 icon checklist | 🖼️ Static | CapCut: 3 dấu tick pop lần lượt |
| 46 | MC cảnh báo | 🖼️ Static | Ken Burns tĩnh |
| 47 | Chapter card "đừng vội" | 🖼️ Static | CapCut: chữ giữ 2s |
| 48 | MC giới thiệu video sau | 🖼️ Static | Ken Burns tĩnh |
| 49 | Đồng xu biến giỏ hàng | **🎬 ANIMATE** | Kling: hiệu ứng biến hình |
| 50 | MC mỉm cười ấm áp | 🖼️ Static | Ken Burns tĩnh |
| 51 | MC mời comment | 🖼️ Static | CapCut: bong bóng chat pop-in |
| 52 | MC chốt lời hứa | 🖼️ Static | Ken Burns tĩnh |
| 53 | Logo/tên kênh | 🖼️ Static | CapCut: fade in |
| 54 | MC vẫy tay | **🎬 ANIMATE** | Kling: cử chỉ vẫy tay |
| 55 | Fade out | 🖼️ Static | Ken Burns fade chậm 1.5s |

**Rút ra từ ví dụ:** 14 scene animate tập trung đúng 3 nhóm nêu trên — không có scene nào animate chỉ vì "có vẻ nên làm cho đẹp". Đây là mẫu tham khảo khi phân loại scene cho các video tiếp theo.
