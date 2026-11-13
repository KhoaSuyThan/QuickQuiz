# Nhật Ký Thay Đổi (Changelog) - FastQuiz

Tất cả các thay đổi đáng chú ý của dự án FastQuiz sẽ được ghi nhận tại tài liệu này.
Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

Phiên bản mới nhất sẽ luôn được cập nhật tự động lên đầu file.
---
## [1.6.6] - 2026-11-13

### Sửa Triệt Để Lỗi Nút Mở Khóa Sửa Đề & Hỗ Trợ Nhập PIN Cho Cả Đề Con Lẫn Đề Lẻ
- **Khắc phục lỗi Modal PIN không hiển thị khi bấm nút ([components/QuizRunner.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/components/QuizRunner.tsx)):**
  - Trước đó, đoạn render Modal PIN qua `createPortal` bị đặt sai vị trí bên dưới nhánh `if (!isQuizStarted) return (...)`, khiến người dùng bấm vào nút "Mở khóa sửa đề" ở màn hình bắt đầu làm bài không có bất kỳ phản hồi nào.
  - Đã tái cấu trúc biến `pinModalElement` dùng chung và render bao bọc ở tất cả các trạng thái: màn hình chuẩn bị làm bài (`!isQuizStarted`), màn hình tổng kết (`isCompleted`), và màn hình làm bài trực tiếp. Bấm vào nút "Mở khóa sửa đề" hiện modal nhập PIN tức thì.
- **Hỗ trợ mở khóa sửa đề trực tiếp cho cả Đề nhỏ bên trong Bộ Đề:**
  - Không bắt người dùng phải quay ra trang bộ đề bên ngoài mới được nhập mã PIN. Ngay tại màn hình đề con (như `DATASYST`), người dùng có thể bấm nút **"Mở khóa sửa đề"** và nhập mã PIN của đề thi hoặc mã PIN của Bộ đề tổng hợp (`TECH123`).
  - Khi mở khóa thành công, hệ thống lưu tự động vào cả mã PIN của đề và mã PIN của bộ đề cha (`collection_pin_*`), chuyển trạng thái `isOwner: true` và hiện ngay nút **"Sửa đề"** để vào trang chỉnh sửa.

## [1.6.5] - 2026-11-13

### Chuẩn Hóa Cơ Chế Sửa Bộ Đề & Đề Thi Đơn Lẻ Theo Mô Hình Phân Quyền
- **Kế thừa quyền sửa từ Bộ Đề Tổng Hợp sang tất cả đề con ([components/QuizRunner.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/components/QuizRunner.tsx), [app/api/quizzes/[code]/route.ts](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/api/quizzes/[code]/route.ts)):**
  - **Không hiển thị nút nhập PIN riêng lẻ cho đề con:** Các đề thi nhỏ nằm trong Bộ đề tổng hợp sẽ ẩn hoàn toàn nút "Mở khóa sửa đề" riêng lẻ. Thay vào đó, đề con hiển thị liên kết dẫn về Bộ đề cha.
  - **Mã PIN vạn năng của Bộ đề:** Người dùng chỉ cần nhập mã PIN một lần duy nhất tại trang Bộ đề tổng hợp (`/collection/[code]`), hệ thống sẽ tự động cấp quyền sở hữu và kích hoạt nút **"Sửa đề"** cho tất cả các đề con bên trong.
  - **Kế thừa quyền trong trang chỉnh sửa:** Trang chỉnh sửa [app/quiz/[code]/edit/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/quiz/[code]/edit/page.tsx) và [components/QuizEditor.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/components/QuizEditor.tsx) tự động nạp mã PIN đã lưu của Bộ đề cha để cho phép lưu thay đổi mà không bị chặn quyền.
- **Đề thi đơn lẻ độc lập luôn hiển thị nút mở khóa PIN:**
  - Đối với các đề thi đơn lẻ không thuộc bộ đề nào (như `QZQ8VJ`), hệ thống luôn hiển thị nút **"Mở khóa sửa đề"** ở màn hình làm bài để bất kỳ ai có mã PIN tác giả đều có thể chủ động nhập mã và chỉnh sửa đề.

## [1.6.4] - 2026-11-13

### Tối Ưu Phân Quyền Sửa Đề & Hoàn Thiện Trải Nghiệm Giao Diện
- **Phân quyền nút Sửa đề tại màn hình làm bài ([components/QuizRunner.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/components/QuizRunner.tsx)):**
  - Người dùng không phải là chủ sở hữu đề thi sẽ bị ẩn hoàn toàn nút **"Sửa đề"**.
  - Nếu đề có cài đặt mã PIN bảo vệ, hệ thống hiển thị nút **"Mở khóa sửa đề"**. Chỉ khi người dùng nhập chính xác mã PIN qua hộp thoại xác thực thì nút **"Sửa đề"** mới được hiển thị.
- **Khắc phục triệt để lỗi "Làm mờ 1 ô vuông" của Modal Nhập PIN:**
  - Áp dụng kỹ thuật `createPortal` đưa toàn bộ Modal PIN ra trực tiếp `document.body` ở cả [app/collection/[code]/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/collection/[code]/page.tsx) và [components/QuizRunner.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/components/QuizRunner.tsx).
  - Loại bỏ thuộc tính `transform/animate-pop` trên thẻ wrapper cha, giúp lớp nền mờ (`backdrop-blur-md`) che phủ trọn vẹn 100vw x 100vh toàn bộ cửa sổ trình duyệt, không còn bị co cụm thành khối ô vuông giữa màn hình kể cả khi zoom tỷ lệ hiển thị.
- **Tóm gọn chiều cao thanh chứa "Bộ Đề Tổng Hợp":**
  - Giảm padding từ `p-6 sm:p-10` xuống `p-5 sm:p-6`, giảm khoảng cách `space-y-6` xuống `space-y-3`.
  - Tinh chỉnh cỡ chữ tiêu đề và đưa nút chia sẻ cùng hàng với nhãn định danh bộ đề; các thông số tác giả, tổng câu hỏi, lượt làm bài được bố trí gọn gàng, giúp chiều cao của banner giảm gần một nửa và giao diện thanh thoát hơn.

## [1.6.3] - 2026-11-13

### Hỗ Trợ Tạo Bộ Đề Tổng Hợp & Dọn Dẹp Trang Lịch Sử Làm Bài
- **Tính năng Tạo Bộ Đề Tổng Hợp trực tiếp tại trang Tạo Mới ([app/create/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/create/page.tsx)):**
  - Bổ sung thanh chuyển đổi linh hoạt: **"Đề Thi Đơn Lẻ"** (nhập câu hỏi trắc nghiệm) và **"Bộ Đề Tổng Hợp"** ([components/CreateContainer.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/components/CreateContainer.tsx)).
  - Xây dựng form tạo bộ đề [components/CreateCollectionForm.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/components/CreateCollectionForm.tsx): Nhập tên bộ đề lớn, mô tả, bật/tắt công khai, mã PIN quản trị và hỗ trợ danh sách checkbox tích chọn các đề thi sẵn có của tài khoản để gộp vào bộ đề.
  - Hỗ trợ tham số `collectionId` khi tạo đề thi đơn lẻ qua API [app/api/quizzes/route.ts](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/api/quizzes/route.ts) và component [components/Uploader.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/components/Uploader.tsx).
- **Dọn dẹp trang Lịch Sử Làm Bài ([app/history/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/history/page.tsx)):**
  - Loại bỏ hoàn toàn khối chức năng cũ *"Danh sách bộ đề bạn đã lưu trên máy (IndexedDB)"*, chuyển trang Lịch sử về chức năng chuyên biệt thuần túy: Theo dõi kết quả làm bài và ôn tập các câu sai.
- **Sửa triệt để 9 lỗi đỏ TypeScript:**
  - Khắc phục toàn bộ 9 lỗi `ts(2339)` và `ts(7006)` trong [app/api/collections/[code]/route.ts](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/api/collections/[code]/route.ts) và [app/api/collections/route.ts](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/api/collections/route.ts) bằng việc ép kiểu Prisma model và khai báo kiểu dữ liệu tường minh.

## [1.6.2] - 2026-11-13

### Nâng Cấp Thiết Kế Giao Diện Modal Nhập Mã PIN Quản Trị (UI/UX Redesign)
- **Thiết kế lại toàn diện Modal Nhập Mã PIN ([app/collection/[code]/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/collection/[code]/page.tsx)):**
  - Nâng cấp phong cách hiện đại với hiệu ứng làm mờ nền sâu (`backdrop-blur-md`), bóng đổ tím `shadow-2xl shadow-purple-950/30`, bo góc 3D mềm mại `rounded-3xl` và hoạt ảnh `animate-pop`.
  - Icon chìa khóa bảo mật `KeyRound` tỏa sáng 3D nổi bật với nền gradient purple-to-indigo.
  - Bổ sung nút đóng nhanh `X` tròn ở góc trên bên phải.
  - Bổ sung huy hiệu (Badge) thông tin nhận diện bộ đề đang mở khóa: `Bộ đề: TECHBUNDLE`.
  - Nâng cấp ô nhập PIN với icon ổ khóa chìm, font monospace in hoa `uppercase`, cỡ chữ lớn `tracking-widest` và viền tím focus sang trọng.
  - Bổ sung thông báo lỗi sinh động với icon `AlertCircle` khi nhập sai PIN.
  - Cải tiến nút hành động: Nút "Hủy bỏ" mềm mại và nút "Mở Khóa Quản Trị" dải màu gradient sắc sảo với hiệu ứng micro-interaction (hover nâng nhẹ, trạng thái xoay loading khi đang xác thực).
  - Bổ sung huy hiệu màu xanh ngọc xác nhận `Đã mở khóa quyền Quản Trị` khi đã là tác giả hoặc mở khóa thành công.

## [1.6.1] - 2026-11-13

### Phân Quyền & Bảo Vệ Quyền Tác Giả Đề Thi (Authorization & Access Control)
- **Thắt chặt quyền chỉnh sửa bộ đề và đề con:**
  - Ẩn hoàn toàn nút **"Tạo Thêm Đề Mới"** và nút **"Sửa Đề"** trong trang chi tiết Bộ đề tổng hợp ([app/collection/[code]/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/collection/[code]/page.tsx)) đối với người dùng không phải là tác giả hoặc quản trị viên; người xem chỉ thấy danh sách đề nhỏ và nút **"Làm Bài"**.
  - Tối ưu câu chỉ dẫn giao diện: Tự động chuyển đổi thông điệp phù hợp giữa tác giả ("Bạn có thể chọn từng đề nhỏ để làm bài luyện tập hoặc chỉnh sửa...") và học viên ("Chọn một đề thi nhỏ bên dưới để bắt đầu làm bài luyện tập.").
  - Thắt chặt điều kiện `isOwner` và `canEdit` tại API [app/api/collections/[code]/route.ts](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/api/collections/[code]/route.ts) và [app/api/quizzes/[code]/route.ts](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/api/quizzes/[code]/route.ts): Bộ đề đã thuộc về một tài khoản thì người dùng khác tuyệt đối không được cấp quyền `isOwner` khi không có mã PIN hợp lệ.
  - Chặn truy cập trái phép tại trang chỉnh sửa đề thi [app/quiz/[code]/edit/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/quiz/[code]/edit/page.tsx): Nếu người dùng lạ gõ URL trực tiếp vào đề của người khác mà không có quyền và không có PIN, hệ thống sẽ chặn hiển thị trình chỉnh sửa và báo lỗi rõ ràng.

## [1.6.0] - 2026-11-13

### Tính Năng Bộ Đề Tổng Hợp (Quiz Collections) & Bộ Lọc Loại Đề Thi
- **Cơ sở dữ liệu (Database Schema & Seeding):**
  - Thêm mô hình và bảng `quiz_collections` (`id`, `share_code`, `title`, `description`, `cover_image`, `edit_passcode`, `is_public`, `user_id`, `created_at`, `updated_at`).
  - Bổ sung cột khóa ngoại `collection_id` vào bảng `quizzes` liên kết với `quiz_collections(id) ON DELETE SET NULL` trong [prisma/schema.prisma](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/prisma/schema.prisma) và [database/schema.sql](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/database/schema.sql).
  - Bổ sung dữ liệu khởi tạo mẫu bộ đề tổng hợp công nghệ `TECHBUNDLE` chứa 2 đề nhỏ trong [database/seed.ts](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/database/seed.ts).
  - Đồng bộ thành công cấu trúc schema lên cơ sở dữ liệu đám mây Neon PostgreSQL qua `prisma db push`.

- **API Backend:**
  - Xây dựng API route mới `POST /api/collections` tạo bộ đề tổng hợp.
  - Xây dựng API route mới `GET /api/collections/[code]`, `PUT`, `DELETE` cho phép xem chi tiết, thống kê tổng câu hỏi, quản lý quyền bảo mật qua mã PIN và chỉnh sửa bộ đề lớn.
  - Nâng cấp API `GET /api/quizzes/community` hỗ trợ tham số lọc `type` (`all`, `collection`, `single`), đồng thời trả về số lượng đề thi nhỏ (`subQuizCount`) và tổng câu hỏi cho bộ đề lớn.

- **Giao diện Người dùng (Frontend UI/UX):**
  - Cập nhật trang [app/community/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/community/page.tsx): Thêm dropdown chọn loại đề thi ("Tất cả đề thi", "📚 Bộ đề tổng hợp", "📝 Đề thi đơn lẻ") ngay cạnh thanh tìm kiếm; hiển thị thẻ card riêng biệt với huy hiệu `Bộ tổng hợp` và nút `Xem Bộ Đề`.
  - Xây dựng trang chi tiết bộ đề [app/collection/[code]/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/collection/[code]/page.tsx): Hiển thị đầy đủ thông tin bộ đề lớn, tổng số câu hỏi, lượt làm bài, danh sách toàn bộ các đề thi nhỏ bên trong kèm nút `Làm Bài` và nút `Sửa Đề` (cho phép chỉnh sửa độc lập từng đề con).
  - Tối ưu trang **Bộ Đề Của Tôi** ([app/my-quizzes/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/my-quizzes/page.tsx)) và **Trang chủ** ([app/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/page.tsx)): Tự động gom các đề con đã thuộc Bộ đề lớn lại và chỉ hiển thị 1 thẻ duy nhất đại diện cho Bộ đề tổng hợp (kèm huy hiệu `Bộ tổng hợp`, số lượng đề con & tổng câu hỏi); loại bỏ việc hiển thị dàn trải các đề con ra ngoài danh sách chính.
  - Bổ sung nút **Xóa đề thi nhỏ (Trash Icon)** ngay trên từng thẻ đề con trong trang chi tiết Bộ đề tổng hợp ([app/collection/[code]/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/collection/[code]/page.tsx)): Cho phép tác giả hoặc người quản trị xóa đề thi nhỏ độc lập với hộp thoại xác nhận an toàn và cập nhật tức thì số lượng đề con / tổng câu hỏi.
  - **Khắc phục lỗi (Bug Fixes):**
    - Sửa 8 cảnh báo/lỗi kiểu TypeScript trong [app/api/quizzes/my/route.ts](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/api/quizzes/my/route.ts) liên quan đến định kiểu callback và `quizCollection`.
    - Khắc phục lỗi `Internal Server Error (500)` khi mở trang [app/collection/[code]/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/collection/[code]/page.tsx) bằng cách chuyển cơ chế đọc tham số URL sang `useParams()` chuẩn của Next.js App Router.

## [1.5.0] - 2026-11-12

### Kho Đề Thi Cộng Đồng & Chặn Trùng Lặp Đáp Án
- **Kho Đề Thi Cộng Đồng (Public Community Quizzes):**
  - Bổ sung cột `is_public` vào bảng `quizzes` trong cơ sở dữ liệu Neon ([prisma/schema.prisma](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/prisma/schema.prisma) và [database/schema.sql](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/database/schema.sql)).
  - Xây dựng API `GET /api/quizzes/community` lấy danh sách toàn bộ các đề thi công khai, hỗ trợ tìm kiếm từ khóa và sắp xếp theo lượt làm / thời gian.
  - Xây dựng giao diện trang mới [app/community/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/community/page.tsx) ("Kho Đề Thi") hiển thị thẻ đề thi chuyên nghiệp kèm tên tác giả tạo đề (`Tạo bởi: ...`).
  - Bổ sung tab "Kho Đề Thi" trên thanh điều hướng [components/Navbar.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/components/Navbar.tsx).
- **Đồng Bộ Đề Thi Theo Tài Khoản & Tùy Chọn Public / Private:**
  - Cập nhật trang chủ [app/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/page.tsx): Đổi tiêu đề thành "Đề thi của bạn", ưu tiên tải danh sách đề thuộc tài khoản đã đăng nhập từ đám mây.
  - Bổ sung **thanh gạt (Toggle Switch Slider) trực tiếp trên từng thẻ card đề thi** tại trang chủ và trang [app/my-quizzes/page.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/my-quizzes/page.tsx), cho phép người dùng gạt chuyển đổi Công khai / Riêng tư tức thì với hiệu ứng mượt mà.
  - Xây dựng API `PATCH /api/quizzes/[code]` hỗ trợ cập nhật nhanh trạng thái `isPublic` mà không cần gửi lại toàn bộ danh sách câu hỏi.
  - Nâng cấp thanh gạt slider chuẩn hiện đại trong form tạo đề ([components/Uploader.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/components/Uploader.tsx)) và form sửa đề ([components/QuizEditor.tsx](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/components/QuizEditor.tsx)).
  - Khắc phục triệt để lỗi TypeScript `ts(2353)` trong [app/api/quizzes/[code]/route.ts](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/app/api/quizzes/[code]/route.ts).
- **Kiểm Soát & Chặn Trùng Lặp Đáp Án (Duplicate Answers Validation):**
  - Xây dựng hàm kiểm tra `hasDuplicateAnswers` trong [lib/parser.ts](file:///c:/Users/aaa/Pictures/SaveCode/QuickQuiz/lib/parser.ts) chuẩn hóa không phân biệt chữ hoa/thường và khoảng trắng thừa.
  - Áp dụng kiểm tra chặn trùng đáp án trên toàn bộ quy trình: Bộ phân tích text/CSV/Excel, form tạo đề Uploader, form chỉnh sửa QuizEditor và các API lưu trữ phía Server (`POST /api/quizzes`, `PUT /api/quizzes/[code]`).

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
