# Nhật Ký Thay Đổi (Changelog) - FastQuiz

Tất cả các thay đổi đáng chú ý của dự án FastQuiz sẽ được ghi nhận tại tài liệu này.
Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

Phiên bản mới nhất sẽ luôn được cập nhật tự động lên đầu file.
---
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
