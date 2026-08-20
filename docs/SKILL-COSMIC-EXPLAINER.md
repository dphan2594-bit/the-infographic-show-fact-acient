# SKILL-COSMIC-EXPLAINER.md
## Hệ thống prompt AI ảnh tĩnh — Phong cách "Cosmic Flat Vector" (tham chiếu: Kurzgesagt – In a Nutshell)

**Mục đích:** Sinh ảnh tĩnh phong cách vector phẳng nền vũ trụ kiểu Kurzgesagt, dùng cho video giải thích khoa học/lịch sử và carousel mạng xã hội. Đây là doc **song song** với [`SKILL-FLAT-EXPLAINER.md`](SKILL-FLAT-EXPLAINER.md) (phong cách The Infographics Show), KHÔNG thay thế — hai style dùng cho hai loại nội dung khác nhau, xem Mục 1.

-----

## 0. RANH GIỚI BẢN QUYỀN — ĐỌC TRƯỚC KHI VIẾT PROMPT

Kurzgesagt là studio có thật, có tài sản sở hữu trí tuệ riêng. Ngôn ngữ thị giác chung (vector phẳng, nền vũ trụ, màu bão hoà) **không ai độc quyền được** — nhưng những thứ sau thì có:

```
KHÔNG dùng trong prompt:
  ✗ Tên studio ("Kurzgesagt style", "in a nutshell style")
  ✗ Nhân vật chim đặc trưng của họ (con chim tròn nhiều màu)
  ✗ Logo, watermark, bảng màu thương hiệu chính xác của họ
  ✗ Bố cục sao chép 1:1 từ một frame cụ thể trong video của họ

NÊN dùng thay thế:
  ✓ Mô tả trực tiếp ngôn ngữ thị giác (xem Mục 3)
  ✓ Nhân vật hình học riêng của bạn (Mục 4, K3)
  ✓ Bảng màu ở Mục 5 — bộ này do repo tự định nghĩa
```

Gọi tên studio trong prompt vừa là vấn đề bản quyền, vừa **cho kết quả tệ hơn**: model sẽ cố nhái nhân vật thay vì bám nguyên tắc thị giác bạn cần. Mô tả cơ chế luôn ăn đứt gọi tên.

-----

## 1. KHI NÀO DÙNG STYLE NÀY, KHI NÀO DÙNG FLAT-EXPLAINER

| | **Cosmic Flat Vector** (doc này) | **Flat Explainer** (doc kia) |
|---|---|---|
| Nền | Vũ trụ tối, xanh navy sâu | Nội thất/bối cảnh sáng, be |
| Viền nét | **Không viền** — chỉ khối màu đặc | Viền đen/trắng dày |
| Nhân vật | Sinh vật hình học tối giản, bo tròn | Người cách điệu, đầu to |
| Chiều sâu | Tương phản kích thước + quầng sáng | Chồng lớp, cận cảnh vật thể |
| Cảm giác | Choáng ngợp, vũ trụ, "zoom out" | Gần gũi, đời thường, "kể chuyện" |
| Hợp nội dung | Khoa học, quy mô lớn, lịch sử vĩ mô, thống kê trừu tượng | Tài chính cá nhân, tâm lý, đời sống, quy trình cụ thể |

**Quy tắc chọn:** nội dung càng **trừu tượng và lớn** (thiên văn, tiến hoá, đế chế, dân số, khí hậu) → Cosmic. Nội dung càng **cá nhân và cụ thể** (lương, nợ, thói quen, sức khoẻ) → Flat Explainer.

-----

## 2. NGUYÊN TẮC BẤT BIẾN: CHỮ KHÔNG DO AI SINH

Giữ nguyên như Mục 2 của doc kia — và với style này còn quan trọng hơn, vì chữ luôn nằm trên nền tối và cần độ nét tuyệt đối.

→ **Luôn sinh ảnh KHÔNG chữ.** Chữ tiếng Việt có dấu được overlay bằng Remotion (`src/kurzgesagt/components/Type.tsx`), font Nunito đã nạp sẵn ở `public/fonts/`. Không bao giờ để AI viết chữ.

Hệ quả bố cục: mọi prompt phải **chừa vùng trống** cho chữ. Xem `[COMPOSITION]` ở Mục 3.

-----

## 3. CÔNG THỨC PROMPT CHUNG

Khối `STYLE BLOCK` dưới đây phải **dán y nguyên vào mọi prompt** — đây là thứ giữ cho 20 tấm ảnh trông cùng một bộ:

```
STYLE BLOCK (bất biến — copy nguyên văn):

flat vector illustration, 2D digital art, no outlines, no black stroke,
solid filled shapes only, extremely saturated colors on a deep dark navy
background (#080B22), soft radial glow halo around bright objects,
simple rounded geometric forms, clean minimal science-communication
infographic aesthetic, crisp edges, no texture, no noise, no shading
gradients on the objects themselves, centered symmetric composition
```

**Prompt đầy đủ = STYLE BLOCK + 3 biến:**

```
[SUBJECT] — chủ thể chính, mô tả bằng hình khối chứ không bằng tên
[PALETTE]  — 2–3 mã hex lấy từ Mục 5, ghi rõ màu nào cho vật nào
[COMPOSITION] — vị trí chủ thể + vùng trống chừa cho chữ
+ STYLE BLOCK
+ no text, no watermark, no logo, no letters, no numbers
```

**Ví dụ hoàn chỉnh:**

```
A single large glowing sphere at the centre of the frame, three thin
concentric orbit rings around it, twelve tiny identical dots spaced evenly
along the outermost ring. Sphere in warm gold #FFB627, rings and dots in
sky blue #3BB2F6. Sphere occupies the middle third; the bottom third of
the frame is empty dark space reserved for a caption.
flat vector illustration, 2D digital art, no outlines, no black stroke,
solid filled shapes only, extremely saturated colors on a deep dark navy
background (#080B22), soft radial glow halo around bright objects,
simple rounded geometric forms, clean minimal science-communication
infographic aesthetic, crisp edges, no texture, no noise, no shading
gradients on the objects themselves, centered symmetric composition,
no text, no watermark, no logo, no letters, no numbers
```

### Negative prompt (bắt buộc, dùng chung mọi ảnh)

```
3D render, photorealistic, realistic lighting, outlines, black outline,
line art, sketch, watercolor, painterly, canvas texture, film grain, noise,
drop shadow, bevel, glossy reflection, cluttered background, busy detail,
text, letters, numbers, watermark, logo, signature, human face detail,
photograph
```

> `outlines` / `black outline` nằm trong negative là điểm **khác biệt lớn nhất** so với doc Flat Explainer (ở đó viền dày là đặc trưng bắt buộc). Nhầm chỗ này là ảnh ra sai style ngay.

-----

## 4. ARCHETYPE CẢNH (K1–K8)

Đặt tên K để không đụng E1–E10 của doc kia.

### K1 — Cosmic Hero (mở đầu / hook)
Một thiên thể/vật thể phát sáng duy nhất giữa khung, nền sao thưa. Dùng cho scene mở và thumbnail.
```
[SUBJECT] a single large glowing sphere centred in deep space, sparse tiny
stars scattered in the background, faint concentric ring around the sphere
[COMPOSITION] sphere in upper-middle area, lower 35% of frame left empty
```

### K2 — Scale Comparison (so sánh kích thước)
Nhiều vật thể cùng loại, khác kích thước, xếp hàng ngang trên một đường nền chung. Đây là archetype **mạnh nhất** của style này — dùng bất cứ khi nào nội dung có "lớn hơn / nhỏ hơn bao nhiêu lần".
```
[SUBJECT] five spheres of dramatically different sizes lined up in a row on
a common baseline, from tiny on the left to enormous on the right, each a
different flat colour
[COMPOSITION] row occupies middle band, empty space above for labels
```

### K3 — Geometric Creature (nhân vật)
Sinh vật tối giản **của riêng bạn**: thân là 1–2 khối bo tròn, mắt là 2 chấm trắng, không mũi, không miệng, không viền. Giữ đúng một thiết kế xuyên suốt kênh.
```
[SUBJECT] a small simple creature made of two stacked rounded shapes, two
white dot eyes, no mouth, no outline, standing on a small curved surface
```

### K4 — Cutaway / Cross-section (bổ đôi)
Cắt lát một quả cầu/vật thể để lộ các lớp bên trong, mỗi lớp một màu. Dùng khi nội dung là "bên trong nó có gì".
```
[SUBJECT] a sphere cut in half revealing four concentric coloured layers
inside, each layer a distinct flat colour, cross-section facing the viewer
```

### K5 — Flow Ribbon (dòng chảy)
Băng/ống cong dày nối các nút, có mũi tên chỉ hướng. Dùng cho nhân quả, chu trình, luồng vật chất.
```
[SUBJECT] a thick curved ribbon flowing from left to right connecting three
circular nodes, small triangular arrowheads along the ribbon indicating
direction
```

### K6 — Grid of Many (số lượng lớn)
Hàng trăm đơn vị nhỏ giống hệt nhau xếp lưới đều — biến con số trừu tượng thành khối lượng nhìn thấy được. Một phần đổi màu để biểu thị tỉ lệ.
```
[SUBJECT] a perfectly regular grid of 200 identical small rounded squares,
about one fifth of them in a contrasting bright colour, the rest in a muted
dark tone
```

### K7 — Timeline Ribbon (mốc thời gian)
Một dải ngang xuyên khung, các điểm mốc là hình tròn nằm trên dải.
```
[SUBJECT] a horizontal band crossing the entire frame, five evenly spaced
circular markers sitting on the band, each marker a different flat colour
```

### K9 — Cảnh trên đường chân trời (Horizon Scene) — QUAN TRỌNG NHẤT
Đây là archetype "xương sống" của style này: một đường cong hành tinh chiếm đáy
khung, cảnh vật (thành phố, tường thành, cột đền) dựng trên đó, nhân vật đứng rải
rác để tạo tỉ lệ. Bầu trời phía trên để trống cho chữ.
```
[SUBJECT] a curved planet surface filling the bottom third of the frame, a small
flat-vector city of simple columned buildings standing on it, several tiny
rounded creatures with two white dot eyes standing nearby for scale, a glowing
sphere in the sky above
[COMPOSITION] horizon in the lower third, upper half empty dark sky for a title
```

### K10 — Đám đông thưa dần (Thinning Crowd)
Cùng một nhân vật lặp lại dọc một đường, khoảng cách giữa họ nói lên vấn đề —
càng thưa càng yếu. Dùng cho "không đủ người", "dàn trải quá mỏng".
```
[SUBJECT] a long battlemented wall running across a curved horizon with evenly
spaced towers, only four small creature figures standing guard along its entire
length, large empty gaps between them
```

### K8 — Before / After Split (đối lập)
Khung chia đôi bằng một đường thẳng đứng, hai bên cùng bố cục nhưng khác trạng thái/màu.
```
[SUBJECT] frame split vertically into two halves by a thin line, the same
simple object rendered on both sides, healthy and bright on the left,
fragmented and dim on the right
```

-----

## 5. BẢNG MÀU — NGUỒN SỰ THẬT DUY NHẤT

Các mã này **trùng khớp với `src/kurzgesagt/theme.ts`**. Sửa một bên thì phải sửa bên kia, nếu không ảnh AI và chữ overlay sẽ lệch tông.

| Vai trò | Hex | Dùng cho |
|---|---|---|
| Nền vũ trụ (xa) | `#080B22` | Nền chính mọi ảnh — luôn cố định |
| Nền vũ trụ (gần) | `#1B2455` | Vùng sáng nhẹ giữa khung |
| Vàng | `#FFB627` | Chủ thể chính, nguồn sáng, "cái đang được nói tới" |
| Cam | `#FB8500` | Biến thể ấm của vàng, cảnh báo nhẹ |
| San hô | `#EF476F` | Nguy cơ, mất mát, sụp đổ |
| Ngọc | `#06D6A0` | Sống sót, tích cực, giải pháp |
| Xanh trời | `#3BB2F6` | Dữ liệu, đo lường, quy mô |
| Tím | `#8B6FF7` | Lực bên ngoài, cái chưa biết |
| Giấy | `#F4F1E8` | Chữ tiêu đề (overlay, không phải trong ảnh) |
| Mờ | `#9AA2CE` | Chữ phụ, nhãn trục |

**Quy tắc dùng màu:**

```
□ Nền LUÔN là #080B22 — không đổi giữa các ảnh, đây là chất keo giữ bộ ảnh liền mạch
□ Mỗi ảnh tối đa 3 màu accent, KHÔNG kể nền
□ Một màu = một ý nghĩa, giữ nguyên xuyên suốt cả video/carousel
   (vd: đã lấy san hô = "sụp đổ" thì không dùng san hô cho thứ khác)
□ Vật thể quan trọng nhất lấy màu sáng nhất (vàng), mọi thứ khác nhường nó
```

-----

## 6. GIỮ NHẤT QUÁN GIỮA NHIỀU ẢNH — PHẦN KHÓ NHẤT

Đây là điểm yếu cố hữu của AI image gen: 20 ảnh sinh riêng lẻ sẽ ra 20 style hơi khác nhau. Cách xử lý, theo thứ tự hiệu quả:

1. **Sinh "ảnh mỏ neo" trước.** Làm 1 ảnh K1 thật ưng ý → dùng nó làm *style reference / image prompt* cho toàn bộ ảnh còn lại (Midjourney `--sref`, Ideogram style reference, GPT-image reference).
2. **Dán STYLE BLOCK y nguyên**, không diễn đạt lại theo ý mình ở từng ảnh.
3. **Khoá seed** nếu công cụ hỗ trợ, sinh cả loạt cùng một seed family.
4. **Ghi hex vào prompt**, đừng ghi tên màu ("gold" ra mỗi lần một sắc, `#FFB627` thì không).
5. **Hậu kiểm bằng mắt**: xếp cả bộ ảnh cạnh nhau ở kích thước nhỏ. Tấm nào "nhảy" ra khỏi bộ thì sinh lại, đừng cố sửa bằng hậu kỳ.

> Nếu sau 3 vòng vẫn không đồng nhất được một archetype nào đó (thường là K6 lưới đều và K2 so sánh kích thước — AI rất kém đếm và canh tỉ lệ), **chuyển archetype đó sang vẽ bằng code** trong Remotion. Bộ component ở `src/kurzgesagt/components/` đã làm sẵn được K2, K6, K7. Đây là lối thoát chính đáng, không phải thất bại.

-----

## 7. CAROUSEL MẠNG XÃ HỘI (1080×1080)

### Cấu trúc 7 slide chuẩn

```
Slide 1 — HOOK       K1  Một hình ảnh + câu hỏi cực đoan. Không giải thích gì.
Slide 2 — BỐI CẢNH   K7  Đặt mốc thời gian/quy mô để người xem biết đang ở đâu.
Slide 3 — NHỊP 1     K2  Ý chính thứ nhất, kèm 1 con số.
Slide 4 — NHỊP 2     K4  Ý chính thứ hai — nên là ý "mở khoá cơ chế".
Slide 5 — NHỊP 3     K5  Ý chính thứ ba, dẫn tới hệ quả.
Slide 6 — CHỐT       K8  Đối lập trước/sau, hoặc kết luận một câu.
Slide 7 — CTA        K1  Quay lại hình mở đầu, thêm lời mời theo dõi.
```

### Quy tắc bố cục vuông

Khung vuông khác khung ngang: chủ thể phải **nhỏ hơn bạn nghĩ**.

```
□ Chủ thể chiếm tối đa 55% chiều cao khung, đặt lệch lên trên
□ Chừa TRỌN 30% dưới cho chữ — ghi rõ trong [COMPOSITION] của prompt
□ Lề an toàn 80px mỗi cạnh (Instagram cắt mép khi hiện ở feed)
□ Một slide = một ý. Không nhồi hai con số vào một slide.
□ Chữ tiêu đề tối thiểu 56px để đọc được trên điện thoại
```

Đuôi `[COMPOSITION]` dùng cho carousel:
```
square 1:1 composition, subject in the upper 55% of the frame, the entire
bottom third is empty dark background reserved for a caption, generous
margins on all sides
```

-----

## 8. THUMBNAIL YOUTUBE (1280×720)

Khác carousel ở chỗ phải **thắng ở kích thước tem thư**. Nguyên tắc:

```
□ ĐÚNG MỘT chủ thể. Thumbnail style này thất bại vì nhồi nhét, không vì đơn giản.
□ Chủ thể chiếm 40–50% khung, lệch sang một bên
□ Nửa còn lại để trống hoàn toàn cho chữ tiêu đề (overlay ở hậu kỳ)
□ Tương phản sáng/tối cực mạnh: vật thể rực trên nền gần như đen
□ Bỏ hết sao nền — nhiễu ở kích thước nhỏ
```

```
[COMPOSITION] cho thumbnail:

subject positioned in the right half of the frame, the entire left half is
empty near-black space reserved for a title, extreme contrast between the
glowing subject and the dark background, no background stars, wide 16:9
```

Style này **không** dùng mặt người biểu cảm phóng đại như thumbnail Flat Explainer (Mục 9 doc kia). Sức hút đến từ **quy mô và độ tương phản**, không từ cảm xúc khuôn mặt.

-----

## 9. QUY TRÌNH LÀM MỘT VIDEO HOÀN CHỈNH

```
1. Viết kịch bản, chia scene (mỗi scene 1 ý)
2. Với mỗi scene, chọn archetype K1–K8 theo Bảng Dịch Mã (Mục 0 doc kia
   vẫn áp dụng — chiến lược nội dung dùng chung cho cả hai style)
3. Sinh "ảnh mỏ neo" (Mục 6) → sinh toàn bộ ảnh scene, KHÔNG chữ
4. Thả ảnh vào public/images/, audio TTS vào public/audio/
5. Khai báo trong content/manifest.json
6. node scripts/build-scenes.mjs   (tự đo độ dài audio → frame)
7. npm run dev  → kiểm tra trong Remotion Studio
8. npx remotion render <composition> out/video.mp4
```

Với ảnh nền tối của style này, các field trong manifest cần lưu ý:

```json
{
  "fit": "contain",
  "letterboxColor": "#080B22",
  "captionBar": { "color": "#080B22", "heightPercent": 16, "position": "bottom" }
}
```

`letterboxColor` phải đúng `#080B22` — dùng màu khác sẽ lộ đường viền giữa ảnh và nền.

-----

## 10. THAM CHIẾU CODE

Bộ component dựng sẵn theo đúng bảng màu và nguyên tắc trên, dùng khi cần độ chính xác mà AI không cho được:

| File | Nội dung |
|---|---|
| `src/kurzgesagt/theme.ts` | Bảng màu, font, FPS, độ dài scene — nguồn sự thật |
| `src/kurzgesagt/anim.ts` | Spring entrance, ramp, drift — dùng chung mọi animation |
| `src/kurzgesagt/components/SpaceBackground.tsx` | Nền vũ trụ + sao nhấp nháy, 3 tông (calm/warm/grim) |
| `src/kurzgesagt/components/Orb.tsx` | Đĩa phẳng + quầng sáng (K1) |
| `src/kurzgesagt/components/Type.tsx` | Headline / Body / Eyebrow tiếng Việt |
| `src/kurzgesagt/components/Stat.tsx` | Số đếm tăng dần + nhãn, chip |
| `src/kurzgesagt/components/CauseLayout.tsx` | Khung cảnh chuẩn: eyebrow + tiêu đề + hình + câu chốt |
| `src/kurzgesagt/illustration/parts.tsx` | **Thư viện hình vẽ**: PlanetArc, Creature, City, Temple, Wall, Tower, Coin, SunRays, Glow |

### Hai hàm bắt buộc khi vẽ trên hành tinh

Đường chân trời là một hình tròn bán kính rất lớn, nên **mặt đất tụt xuống rất
nhanh khi ra xa tâm khung**. Đặt vật ở một `y` cố định là nó sẽ lơ lửng ở hai mép.

```ts
arcY(x, ground)      // độ cao mặt đất tại x — mọi thứ đứng trên đất phải dùng
arcAngle(x, ground)  // góc nghiêng mặt đất tại x — vật dài (tường, cầu dẫn) phải xoay theo
```

Bán kính lớn = thế giới phẳng hơn = vật ở mép ít nghiêng. Dưới ~3000 thì cầu dẫn
nước và tường thành ở mép khung bắt đầu trông như sắp đổ.

### Nguyên tắc nhân vật

```
□ MỘT thiết kế thân duy nhất cho cả kênh — chỉ đổi phụ kiện, không đổi hình thân
□ Hai chấm mắt trắng, KHÔNG miệng, KHÔNG viền, KHÔNG mũi
□ Phụ kiện phân vai: helmet = lính, crown = hoàng đế, hood = dân di cư, spear = vũ trang
□ Nhân vật luôn NHỎ so với công trình — chênh lệch tỉ lệ chính là thứ tạo cảm giác quy mô
□ Phụ kiện không được che mắt: mọi thứ đội đầu phải kết thúc phía trên y = -52
```

Composition mẫu hoàn chỉnh: `WhyRomeFell` (`src/kurzgesagt/RomeVideo.tsx`) — 9 scene, 1920×1080, toàn bộ vẽ bằng code, không dùng ảnh AI. Dùng làm tham chiếu khi cần biết một scene "đúng style" trông thế nào.
