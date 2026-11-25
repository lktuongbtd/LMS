# LMS LKT – Hệ thống quản lý học tập THPT

Web app LMS chạy hoàn toàn trên **GitHub Pages** (không cần máy chủ trả phí), tuỳ chọn đồng bộ dữ liệu miễn phí bằng **Google Apps Script + Google Sheets**.

**Tác giả:** Lương Khánh Tường – Trường THPT Bình Thạnh Đông, An Giang · ĐT/Zalo: 0916780807

---

## 1. Chức năng

| Nhóm | Chức năng |
|---|---|
| **Tài khoản** | 3 vai trò: Quản trị – Giáo viên – Học sinh · tạo tài khoản **hàng loạt** (dán danh sách hoặc nhập Excel), tự sinh tên đăng nhập/mật khẩu, **xuất Excel danh sách tài khoản**, cấp lại mật khẩu cả lớp, khoá/mở tài khoản |
| **Lớp học** | Tạo lớp, chuyển lớp, tự tạo lớp khi nhập danh sách có cột Lớp |
| **Ngân hàng câu hỏi** | Ngân hàng riêng **11 môn** (Toán, Lí, Hoá, Sinh, Văn, Anh, Sử, Địa, Tin, GDKT&PL, Công nghệ) · 4 dạng: Trắc nghiệm, Đúng/Sai, Trả lời ngắn, Tự luận · 4 mức độ · lọc theo môn/lớp/chủ đề/dạng/mức · soạn có xem trước công thức LaTeX |
| **Số tương tự** | Câu hỏi tham số `a=1..9; b=-5..5!0; k=[2,3,5]` → sinh vô hạn câu khác số, mỗi mã đề một bộ số |
| **Nhập câu hỏi** | Nhập từ văn bản (mẫu có sẵn), nhập/xuất Excel (mẫu có sẵn), nhập cả đề thi từ văn bản |
| **Ma trận & đặc tả** | Ma trận theo **cấu trúc đề tốt nghiệp THPT 2025** của từng môn (tự phân bổ theo chủ đề và ngân hàng), bản đặc tả tự gợi ý yêu cầu cần đạt (sửa được), đối chiếu ngân hàng còn thiếu câu ở ô nào, **sinh đề 1 chạm từ ma trận**, xuất Word |
| **Đề thi** | Tạo thủ công, từ ma trận, từ văn bản · **trộn đề** (đảo câu trong từng phần, đảo phương án, đảo ý Đ/S, thay số theo mã đề) · **ma trận & đặc tả từ đề có sẵn** · xuất Word/PDF: đề từng mã, bảng đáp án, lời giải, ma trận, đặc tả |
| **Học liệu** | Bài giảng soạn thảo (có công thức), video YouTube, link Drive/PDF, tệp đính kèm nhỏ · giao theo lớp · theo dõi ai đã học |
| **Giao bài – thi online** | Hẹn giờ mở/đóng, thời gian làm bài, số lượt, mỗi học sinh nhận mã đề khác nhau, tự lưu khi mất mạng, tự nộp khi hết giờ, ghi nhận rời trang |
| **Chấm điểm** | Chấm tự động theo thang điểm THPT 2025 (Đ/S: 1 ý 0,1 – 2 ý 0,25 – 3 ý 0,5 – 4 ý 1 điểm), giáo viên chấm tay phần tự luận |
| **Thống kê** | Phổ điểm, tỉ lệ đúng từng câu, **bảng điểm theo lớp**, **tiến độ học tập**, xuất Excel |
| **Hình vẽ câu hỏi** | 21 loại hình vẽ tự động: hình chóp, hình hộp, lăng trụ, tam giác, hình bình hành, đường tròn, hệ trục Oxyz, đồ thị hàm số (có tiệm cận, điểm), sơ đồ cây xác suất, hộp bi, xúc xắc, biểu đồ cột/đường, biểu đồ tần số ghép nhóm, minh hoạ thực tiễn (cắt bìa làm hộp, thang dựa tường, bồn trụ, nón, mặt cầu, cổng parabol, cột đèn – bóng, mạch điện). Hình **đổi theo số** của câu tham số |
| **Đề tương tự** | Một chạm tạo 1–10 đề tương tự: câu tham số thay số mới, câu thường thay bằng câu cùng chủ đề – dạng – mức độ |
| **Chuẩn hoá** | Chuẩn hoá hàng loạt: khoảng trắng, tiền tố “Câu n”, nhãn A./B. thừa, dấu thập phân kiểu Việt Nam (công thức dùng `{,}`), đáp án, chủ đề |
| **Tiêu đề & xuất đề** | Mẫu tiêu đề chuẩn (Sở – Trường – Kì thi – Năm học – ĐỀ CHÍNH THỨC – Mã đề – SBD – khung Điểm/Lời phê – dòng cuối), phương án tự xếp 4/2/1 cột như đề thật, kèm **phiếu trả lời**; xuất **Word .docx – công thức là Equation của Word (chuyển MathType 1 lệnh), có hình, số trang**, **In/PDF đã biên dịch công thức**, **LaTeX ex_test** (.zip kèm thư mục hình) |
| **Ôn lý thuyết** | Tóm tắt kiến thức trọng tâm các môn (theo chương trình GDPT 2018 – bộ Kết nối tri thức), khung định nghĩa/công thức/lưu ý/ví dụ, có hình minh hoạ; giáo viên sửa/thêm chủ đề |
| **Tự luyện** | Học sinh chọn môn – chủ đề – mức độ, chấm ngay từng câu kèm lời giải, lưu lịch sử luyện |
| **Bộ ngân hàng** | Mỗi giáo viên tạo nhiều bộ ngân hàng 🔒 riêng tư hoặc 🌐 dùng chung toàn trường; sao chép/chuyển câu giữa các bộ; tạo đề từ ma trận chọn được bộ nguồn |
| **Xưởng sinh câu** | Sinh hàng loạt câu khác số có hình vẽ từ 29 mẫu sinh câu LKT + câu tham số trong ngân hàng, lưu thẳng vào bộ ngân hàng |
| **Nhập Word** | Tải .docx → tự chuyển về mẫu chuẩn: công thức Equation → LaTeX, ảnh giữ nguyên, **đáp án gạch chân / tô đỏ / tô vàng tự nhận**, đánh số tự động, phương án nằm chung dòng hoặc trong bảng, bảng đáp án cuối đề; sửa trực tiếp – xem trước ngay; tải lại **Word đã chuẩn hoá** |
| **Nhập PDF / ảnh** | Nhận dạng bằng **AI Gemini** (chữ + công thức, khoá API miễn phí) hoặc **OCR** miễn phí, hoặc lấy lớp chữ PDF; **cắt hình** từ trang đề chèn vào câu |
| **Khác** | Thông báo tới lớp, sao lưu/khôi phục JSON, giao diện responsive (điện thoại) |

Cấu trúc đề được cài sẵn (sửa trong `js/bank.js` → `SUBJECTS`):

| Môn | Phần I (TN) | Phần II (Đ/S) | Phần III (TLN) | Thời gian |
|---|---|---|---|---|
| Toán | 12 × 0,25 | 4 × 1 | 6 × 0,5 | 90′ |
| Lí, Hoá, Sinh, Địa | 18 × 0,25 | 4 × 1 | 6 × 0,25 | 50′ |
| Sử, GDKT&PL, Tin, Công nghệ | 24 × 0,25 | 4 × 1 | – | 50′ |
| Tiếng Anh | 40 × 0,25 | – | – | 50′ |
| Ngữ văn | Tự luận (Đọc hiểu 4đ + Đoạn văn 2đ + Bài văn 4đ) | | | 120′ |

## 2. Đưa lên GitHub Pages

1. Tạo repository mới trên GitHub (ví dụ `lms-lkt`), chế độ **Public**.
2. Tải toàn bộ thư mục này lên (giữ nguyên cấu trúc: `index.html`, `config.js`, `assets/`, `js/`, `gas/`).
3. Vào **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
4. Sau 1–2 phút, web chạy tại `https://<tên-tài-khoản>.github.io/lms-lkt/`.

Tài khoản dùng thử: `admin / admin123` · `gv.toan / 123456` · `hs01 … hs10 / 123456`.
**Trước khi dùng thật:** đổi mật khẩu admin, xoá các tài khoản mẫu.

## 3. Hai chế độ chạy

**a) Cục bộ (mặc định, `apiUrl` để trống):** mọi dữ liệu nằm trong trình duyệt của máy đang dùng. Phù hợp dùng thử, soạn ngân hàng/đề, xuất Word, hoặc phòng máy dùng chung một máy chủ.

**b) Đồng bộ đám mây (khuyên dùng cho lớp thật):** học sinh làm bài trên điện thoại/máy ở nhà, giáo viên nhận bài ở máy mình.

1. Tạo một Google Sheet mới → **Tiện ích mở rộng → Apps Script**.
2. Dán nội dung `gas/Code.gs`, đổi `WRITE_KEY` thành một chuỗi bí mật.
3. **Triển khai → Tùy chọn triển khai mới → Ứng dụng web** · Thực thi: *Tôi* · Quyền truy cập: *Bất kỳ ai* → cấp quyền → copy URL `/exec`.
4. Mở `config.js` trên GitHub, dán URL vào `apiUrl`, commit.
5. Giáo viên đăng nhập → **Cài đặt** → nhập *Khoá ghi* = `WRITE_KEY` → **Kiểm tra kết nối** → **Đẩy lên máy chủ**.
6. Từ đó: mọi thay đổi của giáo viên (lớp, tài khoản, đề, bài giao…) tự đẩy lên sau 2–3 giây; bài nộp và tiến độ của học sinh gửi về máy chủ; giáo viên bấm **🔄 Tải bài nộp** để nhận.

> Khi sửa `Code.gs`, phải **Triển khai → Quản lý bản triển khai → Chỉnh sửa → Phiên bản mới** thì thay đổi mới có hiệu lực.

## 4. Mẫu nhập câu hỏi bằng văn bản

```
[Môn: toan] [Lớp: 12] [Chủ đề: Nguyên hàm và tích phân] [Mức: NB]

Câu 1: Họ nguyên hàm của hàm số $f(x)=\cos x$ là
A. $-\sin x+C$
*B. $\sin x+C$
C. $\cos x+C$
D. $-\cos x+C$
Lời giải: ...

Câu 2 [Đúng/Sai] [TH]: Cho hàm số $y=x^3-3x$.
a) Hàm số đồng biến trên $(1;+\infty)$. (Đ)
b) Hàm số đạt cực đại tại $x=1$. (S)
c) ... (Đ)
d) ... (Đ)

Câu 3 [Trả lời ngắn]: Tính $\int_0^{2}({a}x+1)dx$.
Đáp án: {=2*a+2}
Tham số: a=1..9

Câu 4 [Tự luận]: ...
Đáp án: hướng dẫn chấm
Điểm: 1
```

Mẫu đầy đủ có trong app (Ngân hàng → Nhập văn bản → Chèn mẫu / Tải mẫu .txt). Mẫu Excel: Ngân hàng → Mẫu Excel.

## 5. Câu hỏi “số tương tự”

- `a=1..9` số nguyên ngẫu nhiên · `b=-5..5!0` loại 0 · `k=[2,3,5]` chọn trong danh sách · `c==a+b` biến tính.
- Trong nội dung/phương án/đáp án: `{a}` hoặc biểu thức `{=2*a+b}`; hàm `sqrt, abs, round(x,n), pow, min, max, floor, ceil, ln, log10, pi`.
- *Điều kiện* (tuỳ chọn): `a!=b && a+b>3`. Hệ thống tự thử lại nếu các phương án bị trùng.

## 6. Hình vẽ cho câu hỏi

Trong ô **Hình vẽ** của câu hỏi (hoặc dòng `Hình:` khi nhập văn bản, cột *Hình* khi nhập Excel) ghi `@loại khoá=giá trị; khoá=giá trị`. Chọn “Chèn hình mẫu” trong trình soạn để có sẵn cú pháp. Ví dụ:

| Mục đích | Cú pháp |
|---|---|
| Chóp tứ giác, SA ⊥ đáy | `@chop base=4; vuong=1` (thêm `net=AC:d,BD` để vẽ thêm đoạn; `:d` là nét đứt) |
| Chóp đều có đường cao | `@chop base=4; cao=1; cheo=1` |
| Hình hộp / lăng trụ | `@hop` · `@langtru` |
| Tam giác có cạnh, góc | `@tamgiac ab=5; ca=7; gocA=60°` · `@tamgiac vuong=B` · `cao=A` |
| Oxyz | `@oxyz diem=A(2;0;0),B(0;3;0),C(0;0;2); tri=1; chieu=1` |
| Đồ thị hàm số | `@dothi f=x^3-3*x+1; x=-3:3; y=-3:4; tcd=1; tcn=2; diem=1;-1; xl=t; yl=v` (nhiều hàm: `f=sin(x)|cos(x)`) |
| Sơ đồ cây | `@cay pa=0,6; pba=0,7; pbna=0,2; tich=1` |
| Hộp bi / xúc xắc | `@hopbi do=4; xanh=3` · `@xucxac mat=3,5` |
| Biểu đồ | `@bieudo data=40|45,1|42,8; nhan=2010|2015|2020; donvi=triệu tấn` (`loai=duong` cho biểu đồ đường) |
| Tần số ghép nhóm | `@tansuat khoang=0|20|40|60|80; ts=5|8|12|7; xl=phút` |
| Thực tiễn | `@hopcat canh=30 cm` · `@thang dai=5 m; chan=3 m` · `@tru r=r; h=h` · `@non` · `@matcau` · `@cong rong=8 m; cao=6 m` · `@cotden` · `@mach r=R1,R2; kieu=song` |

Câu tham số dùng được `{a}`, `{=2*a}` trong hình, ví dụ `@dothi f=x^3-3*x+{c}` → mỗi mã đề có đồ thị khớp với số mới. Có thể dán thẳng mã `<svg>` tự vẽ.

## 7. Lưu ý kĩ thuật & bảo mật

- Web tĩnh nên **chấm điểm diễn ra trên trình duyệt**: học sinh rành kĩ thuật có thể soi đáp án bằng công cụ dành cho nhà phát triển. Phù hợp kiểm tra thường xuyên, luyện tập; với kì thi quan trọng nên tổ chức tại phòng máy có giám sát.
- Mật khẩu được băm trước khi lưu, máy chủ không trả mật khẩu băm cho người không có khoá ghi; tuy vậy đây không phải hệ thống bảo mật cấp ngân hàng.
- **Word (.docx)**: công thức LaTeX được **biên dịch sẵn thành Equation (Office Math) của Word** – bấm vào sửa được như gõ bằng Insert → Equation; hình vẽ nhúng thành ảnh; có số trang “Trang x/y”. Muốn chuyển sang **MathType**: mở file trong Word → tab MathType → **Convert Equations** → chọn *Microsoft Office equations* → *MathType equations* → Convert.
- **In / PDF**: công thức được biên dịch bằng KaTeX trước khi mở hộp thoại in (không còn mã LaTeX). Chọn máy in **“Lưu dưới dạng PDF / Save as PDF”**, khổ A4, tỉ lệ 100%, bật “Hình nền/Background graphics”.
- Xuất LaTeX dùng lệnh `\choice`, `\choiceTF`, `\shortans`, `\loigiai` của gói **ex_test**; với phiên bản ex_test cũ chưa có `\choiceTF`/`\shortans` cần cập nhật gói.
- Bộ nhớ trình duyệt khoảng 5 MB: tệp lớn nên để trên Google Drive rồi dán link. Sao lưu JSON định kỳ trong **Cài đặt**.
- Thư viện đi kèm (chạy offline, không cần CDN): KaTeX (MIT), SheetJS Community Edition (Apache 2.0).

## 8. Cấu trúc mã nguồn

```
index.html            khung trang
config.js             cấu hình (tên trường, apiUrl)
assets/style.css      giao diện
assets/vendor/        KaTeX, SheetJS
js/core.js            lưu trữ, đăng nhập, đồng bộ, tiện ích UI, In/PDF, Excel, zip
js/docx.js            xuất Word .docx: biên dịch LaTeX → Equation của Word, nhúng hình, bảng, số trang
js/figures.js         thư viện hình vẽ SVG cho câu hỏi và lý thuyết
js/bank.js            môn học, cấu trúc đề, chủ đề, câu hỏi tham số, nhập văn bản/Excel, ngân hàng mẫu
js/bank2.js           ngân hàng mở rộng (có hình, thực tiễn, đủ mức độ) – 11 môn
js/exam.js            ma trận, đặc tả, sinh đề, trộn đề, đề tương tự, chấm điểm, tiêu đề đề thi, phiếu trả lời, xuất LaTeX ex_test
js/pages-teacher.js   tổng quan, lớp & học sinh, giáo viên, ngân hàng
js/pages-teacher2.js  ma trận, đề thi, học liệu, giao bài, bảng điểm, tiến độ, thông báo, cài đặt
js/pages-student.js   trang học sinh, làm bài, kết quả
js/theory.js          ôn lý thuyết các môn + tự luyện theo chủ đề
js/templates.js       29 mẫu sinh câu có hình + Xưởng sinh câu
js/importer.js        nhập Word/PDF/ảnh: OMML→LaTeX, nhận diện đáp án, AI Gemini, OCR, cắt hình
js/app.js             khung giao diện, đăng nhập, điều hướng
gas/Code.gs           máy chủ đồng bộ Google Apps Script
```

## 9. Nhập đề từ Word – quy ước để máy tự nhận đúng

- Mỗi câu bắt đầu bằng **Câu 1.** / **Câu 1:** (hoặc dùng đánh số tự động của Word).
- Đáp án đúng: **gạch chân** hoặc **tô chữ màu đỏ** (hoặc tô nền vàng) phương án đúng; câu Đúng/Sai gạch chân/tô đỏ các ý **Đúng**.
- Tiêu đề **PHẦN I / PHẦN II / PHẦN III** giúp máy biết loại câu (trắc nghiệm / đúng sai / trả lời ngắn).
- Trả lời ngắn: dòng **Đáp án: …** hoặc **ĐS: …**; lời giải bắt đầu bằng **Lời giải** (có thể ghi “Chọn B”).
- Công thức dùng **Equation của Word** (Insert → Equation). Công thức **MathType** cần chuyển trước: tab MathType → Convert Equations → *Microsoft Office equations*.

## 10. Hướng dẫn cập nhật phiên bản mới (không mất dữ liệu)

Dữ liệu (lớp, tài khoản, ngân hàng, đề, bài nộp) **không nằm trong mã nguồn** nên cập nhật mã không làm mất dữ liệu. Tuy vậy nên sao lưu trước.

**Bước 1 – Sao lưu.** Đăng nhập tài khoản quản trị/giáo viên → **Cài đặt** → **⬇ Sao lưu (.json)**. Nếu dùng đồng bộ, dữ liệu chung đã nằm trên Google Sheet.

**Bước 2 – Giữ lại cấu hình.** Mở file `config.js` đang chạy trên GitHub, chép lại dòng `apiUrl` (URL Apps Script) và tên trường.

**Bước 3 – Tải mã mới lên GitHub.**
1. Giải nén `LMS-LKT.zip` ra máy.
2. Mở `config.js` vừa giải nén, dán lại `apiUrl` và tên trường đã chép ở bước 2, lưu file.
3. Vào repository trên GitHub → **Add file → Upload files** → kéo thả **toàn bộ** các file/thư mục (`index.html`, `config.js`, `README.md`, thư mục `assets`, `js`, `gas`) vào. GitHub tự ghi đè file trùng tên.
4. Ghi chú (ví dụ “Cập nhật v2.1 – xuất Word công thức”) → **Commit changes**.
5. Đợi 1–2 phút (xem tab **Actions** có dấu ✓ xanh), mở lại trang web.

**Bước 4 – Xoá bộ nhớ đệm trình duyệt.** Trên máy tính bấm **Ctrl + F5** (Mac: **Cmd + Shift + R**). Trên điện thoại: đóng hẳn tab rồi mở lại, hoặc mở bằng tab ẩn danh để kiểm tra. Kiểm tra phiên bản ở **Cài đặt → Giới thiệu**.

**Bước 5 – Cập nhật máy chủ Apps Script (chỉ khi dùng đồng bộ và file `gas/Code.gs` có thay đổi).**
1. Mở Google Sheet của hệ thống → **Tiện ích mở rộng → Apps Script**.
2. Chọn hết nội dung `Code.gs` cũ, dán nội dung `gas/Code.gs` mới. **Giữ nguyên dòng `WRITE_KEY` cũ** của trường.
3. Bấm 💾 Lưu → **Triển khai → Quản lý bản triển khai** → biểu tượng ✏️ **Chỉnh sửa** → *Phiên bản*: **Phiên bản mới** → **Triển khai**. (Không tạo “Tùy chọn triển khai mới” để URL không đổi.)
4. Trong LMS: **Cài đặt → Kiểm tra kết nối** phải báo ✅.

**Bước 6 – Kiểm tra nhanh sau cập nhật.**
- Đăng nhập thử 1 tài khoản giáo viên và 1 tài khoản học sinh.
- Vào **Đề thi → ⬇ Xuất** → **Word (.docx)**: mở file bằng Word, bấm vào một công thức thấy khung Equation là đúng.
- Bấm **In / PDF**: bản xem trước hiển thị công thức đẹp, không có dấu `$`.

**Gặp sự cố?** Trang trắng hoặc lỗi lạ: bấm Ctrl + F5; nếu vẫn lỗi, kiểm tra đã tải đủ thư mục `js/` (đặc biệt file mới `js/docx.js`). Mất dữ liệu trên một máy: **Cài đặt → ⬆ Khôi phục** từ file sao lưu, hoặc **⬇ Tải từ máy chủ**.
