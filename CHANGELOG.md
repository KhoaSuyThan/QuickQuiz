# Nhật Ký Thay Đổi (Changelog) - FastQuiz

Tất cả các thay đổi đáng chú ý của dự án FastQuiz sẽ được ghi nhận tại tài liệu này.
Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

Phiên bản mới nhất sẽ luôn được cập nhật tự động lên đầu file.
---
## [1.4.3] - 2026-11-10

### Nâng Cấp Ảnh QR Siêu Nét & Tối Ưu Tách Biệt 2 Chế Độ Hiển Thị
- **Cắt Ảnh Từ Bản Gốc Siêu Nét:**
  - **Cửa sổ thu nhỏ & Thumbnail:** Sử dụng ảnh [public/donate_qr_only.png](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/public/donate_qr_only.png) cắt riêng trọn vẹn khối mã QR vuông vắn 1:1, siêu nét và sạch sẽ.
  - **Cửa sổ phóng to:** Sử dụng ảnh [public/donate_qr_card.png](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/public/donate_qr_card.png) bao gồm đầy đủ logo & chữ VietComBank phía trên, mã QR ở giữa và 2 logo VietQR / Napas 247 phía dưới.
  - Dọn dẹp sạch sẽ toàn bộ các tệp ảnh mờ cũ.

## [1.4.2] - 2026-11-10

### Chuẩn Hóa Ảnh QR Mời Caffe & Thu Gọn Kích Thước Hộp Thoại
- **Sử Dụng Ảnh QR Chuẩn (Ảnh 2):**
  - Chuyển toàn bộ hiển thị sang ảnh mã QR chuẩn gồm logo Vietcombank, mã QR vuông và logo VietQR/Napas247.
  - Thu gọn kích thước hộp thoại phóng to xuống mức vừa vặn (`max-w-[290px]`), cân đối và thoáng mắt.
  - Dọn dẹp toàn bộ các tệp ảnh cắt tạm không cần thiết trong thư mục `public/`.

## [1.4.1] - 2026-11-10

### Khắc Phục Lỗi Hydration Mismatch & Nâng Cấp Hộp Thoại QR Mời Caffe
- **Sửa Triệt Để Cảnh Báo Hydration Mismatch:**
  - Bổ sung `suppressHydrationWarning` vào thẻ `<html>`, `<body>` và các phần tử `<input>`, `<button>` để ngăn trình duyệt cảnh báo khi các tiện ích mở rộng (như Bitwarden, LastPass, autofill extensions) chèn thuộc tính lạ (`fdprocessedid`).
- **Nâng Cấp Hộp Thoại Mời Caffe Thông Minh (Floating Card):**
  - Chuyển sang dạng hộp thoại nổi góc dưới bên phải (`Floating Popover`), không dùng lớp phủ đen (`backdrop`) che mờ màn hình, giúp người dùng làm bài không bị gián đoạn.
  - Cắt mã QR thành hình vuông gọn gàng (`aspect-square`), loại bỏ các khoảng viền xanh thừa dài ngoằng.
  - Tích hợp nút **"Phóng to"** (`Maximize2`) để người dùng chủ động xem toàn cảnh thẻ ngân hàng Vietcombank to rõ nét khi có nhu cầu.

## [1.4.0] - 2026-11-10

### Hệ Thống Quản Lý Người Dùng (Admin User Management) & Footer Mời Caffe
- **Hệ Thống Quản Lý Người Dùng Cho Admin:**
  - Bổ sung tab **"Quản Lý Người Dùng"** trong trang Admin Dashboard (`/admin`).
  - Hỗ trợ xem danh sách toàn bộ thành viên, avatar đại diện, email, ngày tham gia và số lượng đề thi đã xuất bản.
  - Tìm kiếm thời gian thực theo tên hoặc email thành viên.
  - Chức năng phân quyền: Nâng/hạ quyền quản trị viên (`USER` <-> `ADMIN`) linh hoạt.
  - Chức năng xóa tài khoản vi phạm và bảo vệ an toàn tuyệt đối cho tài khoản Quản trị viên tối cao.
- **Footer Tương Tác: Mời Caffe & Facebook Cá Nhân:**
  - Thêm nút **"Mời caffe" ☕** kèm ảnh thu nhỏ mã QR Vietcombank tại góc footer.
  - Tích hợp Modal phóng to toàn màn hình hiển thị mã QR Vietcombank sắc nét, kèm thông tin tài khoản (Chủ TK: `NGUYEN VO LE KHOA`, STK: `1038907514`, Vietcombank PGD Đức Phổ) và nút sao chép STK 1 chạm.
  - Thêm liên kết Facebook cá nhân chính thức: `https://www.facebook.com/lekhoa.nguyenvo.7`.

## [1.3.2] - 2026-11-10

### Tối Ưu Bố Cục Chuẩn Bị Làm Bài: Đặt Cạnh Nhau & Tinh Gọn Thời Gian
- **Bố Cục Hai Cột Cạnh Nhau:**
  - Gộp trường nhập số lượng câu hỏi và trường thời gian làm bài vào chung một khối card chia 2 cột đối xứng (`grid-cols-2`).
- **Tinh Gọn Bộ Chọn Thời Gian:**
  - Loại bỏ hoàn toàn nhãn chữ "Không giới hạn", chỉ hiển thị số nguyên trong ô nhập và menu xổ xuống (5, 10, 15, 30, 45, 60, 90, 120).
  - Đưa nhãn đơn vị **"Phút"** cố định sang bên phải của cụm điều khiển để giao diện trực quan, khoa học và gọn gàng.

## [1.3.1] - 2026-11-10

### Cải Tiến Giao Diện Hộp Chọn Thời Gian Làm Bài (Input Group + Dropdown)
- **Hộp Điều Khiển Thời Gian Hai Thành Phần Tích Hợp:**
  - Thay thế toàn bộ lưới 8 nút chọn thời gian bấm riêng lẻ bằng cụm điều khiển thông minh duy nhất tại màn hình chuẩn bị làm bài.
  - **Ô nhập số bên trái:** Nhận giá trị số nguyên (`> 0`), placeholder mờ `"nhập số"`, tự động lọc bỏ ký tự không phải số và giới hạn tối đa 300 phút.
  - **Mũi tên xổ xuống bên phải (`ChevronDown`):** Cho phép chọn nhanh các mốc thời gian phổ biến (*Không giới hạn, 5 phút, 10 phút, 15 phút, 30 phút, 45 phút, 60 phút, Tùy chỉnh...*).
  - Đồng bộ trạng thái hai chiều giữa việc nhập số thủ công và chọn từ danh sách thả xuống.

## [1.3.0] - 2026-11-10

### Hoàn Thiện Countdown Timer, Web Audio Sound FX, OpenGraph Preview & Chống Spam
- **Chủ Động Chọn Thời Gian Làm Bài & Countdown Timer:**
  - Cho phép người dùng tùy chọn thời gian làm bài tại màn hình chờ: Không giới hạn, 5 phút, 10 phút, 15 phút, 30 phút, 45 phút, 60 phút hoặc tự nhập số phút mong muốn.
  - Đồng hồ đếm ngược `MM:SS` hiển thị realtime trên thanh tiến độ, chuyển màu đỏ nhấp nháy khi còn dưới 60 giây và tự động nộp bài khi hết giờ.
- **Hiệu Ứng Âm Thanh Tương Tác Nguyên Bản (Web Audio API):**
  - Phát âm thanh phản hồi tức thì khi chọn đáp án đúng, sai và âm kèn ăn mừng khi hoàn thành bài mà không phụ thuộc vào file MP3 ngoài.
  - Nút bật/tắt âm thanh (Mute/Unmute) tiện lợi, tự động lưu lựa chọn vào `localStorage`.
- **Dynamic OpenGraph Preview Khi Chia Sẻ Link:**
  - Tạo ảnh xem trước card đồ họa 1200x630px (`/quiz/[code]/opengraph-image`) tự động hiển thị tiêu đề, số lượng câu hỏi và mã đề khi chia sẻ link lên Zalo, Facebook, Messenger.
- **Bảo Mật, Chống Spam & Kiểm Soát Tải Trọng:**
  - Giới hạn tối đa 200 câu hỏi/đề thi ở cả giao diện Uploader và API máy chủ để bảo vệ tài nguyên hệ thống.
  - Áp dụng cơ chế Rate Limiting: tối đa 5 bộ đề trong 10 phút để ngăn chặn spam.
  - Làm sạch dữ liệu đầu vào chống tấn công XSS trong nội dung câu hỏi và đáp án.

## [1.2.2] - 2026-11-10

### Tích Hợp Xác Thực OTP Qua Gmail Thật & Nút Bật/Tắt Hiển Thị Mật Khẩu
- **Xác Thực OTP 2 Bước Qua Gmail Thật (`/forgot-password`):**
  - Tích hợp `nodemailer` kết nối với dịch vụ Gmail SMTP (`khoanv249@gmail.com`) gửi email mã OTP 6 số thực tế với mẫu email HTML chuyên nghiệp.
  - Sinh mã xác thực OTP ngẫu nhiên 6 chữ số, ký số bảo mật bằng JWT và băm `bcrypt` với thời hạn hiệu lực chính xác 5 phút.
  - Giao diện 2 bước trực quan: Bước 1 gửi mã OTP đến email, Bước 2 nhập OTP và tạo mật khẩu mới kèm nút đếm ngược 60 giây gửi lại mã và tùy chọn đổi email.
- **Nút Con Mắt Ẩn/Hiện Mật Khẩu (Show/Hide Password):**
  - Tích hợp nút toggle con mắt (`Eye` / `EyeOff`) tại tất cả các ô nhập mật khẩu:
    - Trang Đăng Nhập (`/login`)
    - Trang Đăng Ký (`/register`)
    - Trang Quên Mật Khẩu (`/forgot-password`)
    - Modal Đổi Mật Khẩu trên thanh điều hướng (`Navbar`)

## [1.2.1] - 2026-11-10

- **Tối Ưu Giao Diện Thanh Điều Hướng (Navbar):**
  - Loại bỏ hiệu ứng khung tròn skeleton xám đen nhấp nháy khi tải phiên người dùng, giúp giao diện hiển thị mượt mà và không bị chớp giật.
- **Bắt Buộc Đăng Nhập Để Làm Bài & Tạo Đề:**
  - Trang làm bài thi (`/quiz/[code]`) và tạo đề thi (`/create`) hiển thị thông báo yêu cầu đăng nhập đối với khách chưa có tài khoản, tự động lưu `callbackUrl` để chuyển hướng ngay sau khi đăng nhập thành công.
  - API tạo đề thi (`POST /api/quizzes`) yêu cầu xác thực phiên đăng nhập hợp lệ.
- **Quyền Sở Hữu Đề Cũ Cho Admin:**
  - Toàn bộ các bộ đề đã tạo trước khi có Auth (`userId: null`) đã được tự động gán quyền sở hữu về cho tài khoản Admin `khoanv249@gmail.com` qua seed script.
- **Phân Quyền Xóa Bộ Đề Thi (Tác Giả & Admin):**
  - Bổ sung API `DELETE /api/quizzes/[code]` cho phép người tạo và Admin xóa vĩnh viễn đề thi.
  - Thêm nút "Xóa đề" trực tiếp trên màn hình cấu hình làm bài (`QuizRunner`), trên thẻ card tại trang chủ (`/`), và trong trang cá nhân (`/my-quizzes`).
- **Trang Quên Mật Khẩu & Tiêu Chuẩn Mật Khẩu Nghiêm Ngặt:**
  - Thay thế cơ chế khôi phục trước đó bằng tính năng Quên mật khẩu chuẩn (`/forgot-password`) với liên kết trực tiếp trên trang đăng nhập (`/login`).
  - Áp dụng kiểm tra độ mạnh mật khẩu (`validatePasswordStrength`): Bắt buộc tối thiểu 8 ký tự, gồm ít nhất 1 chữ cái, 1 chữ số và 1 ký tự đặc biệt cho mọi tính năng Đăng ký, Đổi mật khẩu và Quên mật khẩu.

## [1.2.0] - 2026-11-10

### Hoàn Thành Gộp Phase 2 & 3: Hệ Thống Tài Khoản (Auth Basic) & Trang Quản Trị (Admin Dashboard)
- **Hệ Thống Xác Thực & Quản Lý Phiên (JWT & Cookies):**
  - Đăng ký tài khoản (`/register`), Đăng nhập (`/login`), Đăng xuất (`/api/auth/logout`) với mật khẩu được mã hóa băm bằng `bcryptjs`.
  - Phiên làm việc được bảo vệ bằng JWT token trong HTTP-only Cookie (`jose`).
  - Hỗ trợ đổi mật khẩu trực tiếp trong modal Header (`/api/auth/change-password`).
  - Tự động tạo tài khoản Quản trị viên (Admin) tối cao: `khoanv249@gmail.com` với role `ADMIN`.
- **Trang Quản Trị Hệ Thống Toàn Diện (`/admin`):**
  - Chỉ hiển thị và cấp quyền truy cập cho tài khoản có vai trò `ADMIN`.
  - *KPI Dashboard:* Thống kê trực quan Tổng số bộ đề, Tổng số câu hỏi, Tổng lượt người dùng làm bài và Tổng thành viên.
  - *Quản Lý Bộ Đề:* Bảng dữ liệu tìm kiếm realtime theo tiêu đề hoặc mã đề, hiển thị tác giả, số câu, lượt thi, nút Xem, Sửa đề và Xóa đề vĩnh viễn.
  - *Khóa Khôi Phục Khẩn Cấp Admin (`/admin/recovery`):* Cho phép chủ sở hữu đặt lại mật khẩu admin bằng `ADMIN_SECRET_KEY` mà không lo mất tài khoản.
- **Trang Quản Lý "Bộ Đề Của Tôi" (`/my-quizzes`):**
  - Liệt kê toàn bộ các đề thi do chính tài khoản tạo ra trên cơ sở dữ liệu cloud.
  - Tự động liên kết `userId` khi tạo đề mới nếu người dùng đã đăng nhập.
- **Tối Ưu Giao Diện Thanh Điều Hướng (Navbar):**
  - Tích hợp Avatar, tên người dùng, Menu Dropdown và huy hiệu nút "Admin" nhanh cho Quản trị viên.
- **Cơ Sở Dữ Liệu:** Đã bổ sung bảng `users` và trường liên kết `user_id` trong bảng `quizzes` trên PostgreSQL Neon, cập nhật script SQL và seeding tự động.

## [1.1.0] - 2026-11-10

### Hoàn Thành Phase 1: Chức Năng Chỉnh Sửa Bộ Đề Thi (`/quiz/[code]/edit`)
- **Trang Chỉnh Sửa Đề Thi Toàn Diện (`/quiz/[code]/edit`):** Cho phép nạp lại toàn bộ tiêu đề, mô tả và danh sách câu hỏi của bộ đề để cập nhật mà vẫn giữ nguyên mã chia sẻ `shareCode`.
- **Bộ Soạn Thảo Đa Chế Độ (QuizEditor):** 
  - *Chế độ Sửa Văn Bản (Text Editor):* Tự động chuyển đổi ngược các câu hỏi thành cú pháp chuẩn QuickQuiz với ký tự `*` ở đầu đáp án đúng, cho phép chỉnh sửa nội dung nhanh bằng text.
  - *Chế độ Trực Quan (Visual List):* Cho phép xem từng thẻ câu hỏi, đổi đáp án đúng bằng radio button, sửa text trực tiếp, thêm hoặc xóa câu hỏi linh hoạt.
- **Cơ chế Phân Quyền Bảo Vệ Bằng Mã PIN (editPasscode):**
  - Tự động sinh mã PIN bảo mật dạng `ED-XXXXXX` khi tạo đề mới và lưu vào cột `edit_passcode` trên PostgreSQL.
  - Tự động lưu mã PIN vào `IndexedDB` trên trình duyệt người tạo để tự động xác thực mà không cần gõ lại mã PIN.
  - Hỗ trợ nhập mã PIN khi chỉnh sửa trên thiết bị khác để ngăn chặn người lạ can thiệp đề thi.
- **API Cập Nhật Dữ Liệu (`PUT /api/quizzes/[code]`):** Cập nhật an toàn với Prisma Transaction, xóa câu hỏi cũ và thay thế bằng danh sách câu hỏi mới, đồng bộ lại IndexedDB cục bộ.
- **Tích Hợp Nút Chỉnh Sửa Thuận Tiện:**
  - Bổ sung nút "Sửa đề" trên màn hình chờ của bộ đề ([QuizRunner.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/components/QuizRunner.tsx)).
  - Bổ sung nút "Sửa" trực tiếp trên thẻ card đề thi tại trang chủ ([app/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/page.tsx)).
  - Bổ sung nút "Sửa" trong danh sách đề đã tạo tại trang Lịch sử ([app/history/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/history/page.tsx)).
- **Cơ Sở Dữ Liệu & Khắc phục kiểu TypeScript:** Đã đồng bộ schema Prisma và script SQL `database/schema.sql`, tối ưu kiểu an toàn trong `database/seed.ts`.

## [1.0.7] - 2026-11-09

### Tích hợp Prompt Mẫu Cho AI & Nút Sao Chép 1-Click
- **Trợ lý Prompt mẫu thông minh:** Bổ sung hộp gợi ý Prompt mẫu chuẩn cấu trúc QuickQuiz tại trang tạo đề (`components/Uploader.tsx`), hướng dẫn AI (ChatGPT, Claude, Gemini, DeepSeek) tạo câu hỏi có đánh dấu `*` ở đáp án đúng, có lời giải thích và đúng số lượng lựa chọn.
- **Nút Sao chép Prompt tiện lợi:** Tích hợp nút "Sao chép Prompt" với visual feedback tự động đổi trạng thái sang "Đã sao chép!" trong 2 giây, hỗ trợ clipboard API an toàn.
- **Tùy chọn Xem / Thu gọn linh hoạt:** Người dùng có thể click xem trước toàn bộ nội dung Prompt hoặc thu gọn để không gian nhập liệu luôn gọn gàng.
- **Khắc phục xung đột Favicon Next.js:** Loại bỏ tệp `public/icon.svg` trùng lặp để Next.js App Router ưu tiên `app/icon.svg` tối ưu.

## [1.0.6] - 2026-11-09

### Bổ sung Favicon & Bộ nhận diện thương hiệu cho dự án
- **Thiết kế icon vector sắc nét (`app/icon.svg` & `public/icon.svg`):** Đồng bộ hoàn hảo với logo trên thanh Navbar (nền gradient xanh dương `#2563eb` sang tím indigo `#4f46e5`, bo góc squircle bo tròn và biểu tượng tia sét Zap màu trắng nổi bật). Tự động tương thích màn hình Retina và dark/light mode.
- **Tạo tệp Favicon đa kích thước (`public/favicon.ico` & `app/favicon.ico`):** Sinh file `.ico` chuẩn chứa 3 kích thước 16x16, 32x32, 48x48 phục vụ các trình duyệt legacy, bookmark bar và các bot tìm kiếm.
- **Cấu hình Metadata trong `app/layout.tsx`:** Tích hợp cấu hình `icons` vào Next.js App Router metadata hỗ trợ đầy đủ `icon`, `shortcut`, và `apple-touch-icon`.

## [1.0.5] - 2026-11-09

### Bổ sung ngân hàng câu hỏi Phỏng Vấn Mobile Software Engineer (130 câu)
- **Biên soạn bộ đề chuẩn phỏng vấn chuyên sâu:** Tạo file public/mobile_engineer_interview_quiz.txt gồm 130 câu hỏi thực chiến bao phủ toàn diện: Android/iOS OS Internals, Flutter/React Native, Memory Management (ARC, GC, Leaks), Đa luồng (Coroutines, GCD, Isolates), Clean Architecture/MVVM/MVI, Mobile Security (SSL Pinning, Keystore/Keychain), và Mobile System Design.
- **Tối ưu định dạng:** 100% câu hỏi tuân thủ đúng cú pháp QuickQuiz với đáp án đúng đánh dấu * ở đầu dòng và có giải thích kiến thức chuyên sâu.

## [1.0.4] - 2026-11-09

### Tối ưu Parser & Giao diện tạo đề
- **Khắc phục lỗi nhận nhầm C++:** Sửa thuật toán trong lib/parser.ts chỉ nhận duy nhất dấu * ở đầu dòng đáp án, loại bỏ hoàn toàn regex bắt nhầm dấu + trong các từ khóa công nghệ như C++.
- **Hiển thị sẵn mẫu 1 câu:** Cập nhật components/Uploader.tsx mặc định hiển thị sẵn 1 câu hỏi chuẩn cấu trúc kèm preview tự động ngay khi vào trang, không cần người dùng thao tác click thêm.

## [1.0.3] - 2026-11-09

### Bổ sung ngân hàng câu hỏi GreenKitchen (105 câu trắc nghiệm)
- **Phân tích mã nguồn GreenKitchen:** Khảo sát toàn diện repo GitHub (Flutter, Dart, Firebase Firestore, Provider, TheMealDB API, SharedPreferences, UI/UX).
- **Khởi tạo bộ đề trắc nghiệm chuẩn:** Tạo file public/greenkitchen_quiz.txt gồm 105 câu hỏi kết hợp lý thuyết và thực hành, có giải thích chi tiết, sẵn sàng nạp trực tiếp vào QuickQuiz.

## [1.0.2] - 2026-11-09

### Đổi tên thương hiệu sang QuickQuiz & Sửa lỗi TypeScript
- **Khắc phục triệt để lỗi `ts(2305)`:** Loại bỏ lệnh import `Question` từ `@prisma/client` trong [app/api/quizzes/[code]/route.ts](file:///c:/Users/aaa/Pictures/SaveCode/FastQuiz/app/api/quizzes/[code]/route.ts) và thay thế bằng interface `QuestionItem` tường minh, giải quyết cả `ts(2305)` và `ts(7006)`.
- **Đổi tên toàn diện sang QuickQuiz:**
  - Cập nhật tên ứng dụng trong `package.json` (`quick-quiz`).
  - Cập nhật giao diện: [components/Navbar.tsx](file:///c:/Users/aaa/Pictures/SaveCode/FastQuiz/components/Navbar.tsx), [app/layout.tsx](file:///c:/Users/aaa/Pictures/SaveCode/FastQuiz/app/layout.tsx), [app/create/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/FastQuiz/app/create/page.tsx).
  - Cập nhật tên database cục bộ IndexedDB: `quickquiz_local_db` trong [lib/storage.ts](file:///c:/Users/aaa/Pictures/SaveCode/FastQuiz/lib/storage.ts).
  - Đồng bộ toàn bộ tài liệu hướng dẫn [README.md](file:///c:/Users/aaa/Pictures/SaveCode/FastQuiz/README.md).
- **Kiểm tra biên dịch:** Chạy `npm run build` xác nhận hoàn thành 100% không còn lỗi.

## [1.0.1] - 2026-11-09

### Khắc phục & Cập nhật tài liệu
- **Sửa lỗi TypeScript:** Khắc phục lỗi `ts(7006)` (tham số `q` bị suy luận kiểu `any`) trong file [app/api/quizzes/[code]/route.ts](file:///c:/Users/aaa/Pictures/SaveCode/FastQuiz/app/api/quizzes/[code]/route.ts) bằng cách chỉ định rõ kiểu `(q: Question)`.
- **Cập nhật tài liệu hướng dẫn:** Bổ sung hướng dẫn chi tiết các bước chạy dự án (chế độ siêu nhanh không cần DB, chế độ PostgreSQL và Deploy Vercel) vào [README.md](file:///c:/Users/aaa/Pictures/SaveCode/FastQuiz/README.md).
- **Kiểm tra biên dịch:** Chạy `npm run build` xác nhận hoàn tất 100% không còn lỗi.

## [1.0.0] - 2026-11-09

### Khởi tạo & Xây dựng toàn bộ hệ thống FastQuiz
- **Kiến trúc Fullstack:** Khởi tạo Next.js 15 (App Router, TypeScript, Tailwind CSS) tối ưu hóa triển khai trên Vercel.
- **Cơ sở dữ liệu:**
  - Thiết kế Schema PostgreSQL: Bảng `quizzes` (quản lý bộ đề, mã chia sẻ `share_code`) và bảng `questions` (lưu nội dung và các lựa chọn JSONB).
  - Tạo script SQL gốc [database/schema.sql](file:///c:/Users/aaa/Pictures/SaveCode/FastQuiz/database/schema.sql) và seed script [database/seed.ts](file:///c:/Users/aaa/Pictures/SaveCode/FastQuiz/database/seed.ts).
- **Phân tích dữ liệu đa dạng (Multi-format Parser):**
  - Hỗ trợ dán văn bản thô (Text) với cú pháp tự nhiên (đánh dấu `*` trước đáp án đúng, 3-6 lựa chọn).
  - Hỗ trợ tải file Excel (`.xlsx`) và CSV (`.csv`) kèm tính năng xem trước (Preview) trực quan trước khi lưu.
- **Trình làm bài & Instant Feedback:**
  - Tự chọn số lượng câu hỏi làm ngẫu nhiên từ ngân hàng câu hỏi.
  - Áp dụng thuật toán Fisher-Yates xáo trộn câu hỏi và xáo trộn vị trí đáp án (A/B/C/D).
  - Phản hồi tức thì ngay sau mỗi lượt click: Đúng (Xanh lá), Sai (Đỏ kèm giải thích chi tiết).
- **Tổng kết & Chế độ ôn tập chuyên sâu:**
  - Trang kết quả thống kê tỷ lệ %, số câu đúng/sai, hiệu ứng pháo hoa chúc mừng.
  - Tính năng "Trộn bài & Làm lại toàn bộ" và "Chỉ trộn & Làm lại các câu sai".
- **Lưu trữ bảo mật không cần đăng nhập/đăng ký:**
  - Quản lý lịch sử các lần làm bài và danh sách đề thi cục bộ trên trình duyệt qua IndexedDB (`idb`).
- **Xác thực:** Kiểm tra lệnh biên dịch toàn dự án (`npm run build`) thành công 100%.
