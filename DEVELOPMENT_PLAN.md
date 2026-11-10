# Kế Hoạch Phát Triển Toàn Diện (Development Plan) - QuickQuiz

Tài liệu này vạch ra lộ trình nâng cấp và mở rộng nền tảng QuickQuiz, bổ sung **Chức Năng Chỉnh Sửa Bộ Đề**, **Hệ Thống Tài Khoản & Đăng Nhập**, **Trang Quản Trị (Admin Dashboard)**, **Bảo Mật & Chống Spam**, cùng các **Tính Năng Trải Nghiệm Người Dùng Cao Cấp**.

---

## 1. Phân Hệ 1: Chức Năng Chỉnh Sửa Bộ Đề Thi (`/quiz/[code]/edit`) — *MỚI BỔ SUNG*

### 1.1. Mục tiêu & Vấn đề giải quyết
Hiện tại người dùng chỉ có thể tạo mới bộ đề. Nếu phát hiện sai sót chính tả, muốn đổi đáp án đúng hoặc bổ sung/xóa bớt câu hỏi thì chưa thể sửa được mà phải tạo đề mới hoàn toàn. Tính năng này cho phép cập nhật trực tiếp nội dung đề thi mà vẫn giữ nguyên mã chia sẻ `shareCode`.

### 1.2. Luồng hoạt động (User Flow)
1. **Truy cập trang chỉnh sửa:**
   - Người dùng bấm nút **"Chỉnh sửa đề thi"** từ trang xem đề `/quiz/[code]` hoặc từ trang quản lý của Admin.
   - Đường dẫn: `/quiz/[code]/edit`.
2. **Tải lại dữ liệu:**
   - Hệ thống tự động nạp tiêu đề, mô tả và toàn bộ danh sách câu hỏi hiện tại vào giao diện chỉnh sửa (dưới dạng form trực quan hoặc khung văn bản text chuẩn cú pháp).
3. **Cơ chế phân quyền sửa đề an toàn:**
   - **Cách 1 (Khi chưa có Auth):** Người tạo khi tạo đề có thể đặt thêm một mã PIN sửa đề (Edit Passcode) hoặc tự động lưu khóa quyền sở hữu vào `localStorage` của trình duyệt người tạo.
   - **Cách 2 (Khi có Auth - Đăng nhập):** Tự động kiểm tra `userId` của người đang đăng nhập có trùng với người tạo đề hay không.
   - **Admin:** Admin có toàn quyền chỉnh sửa bất kỳ bộ đề nào từ trang Admin.
4. **Cập nhật dữ liệu:**
   - Gọi API `PUT /api/quizzes/[code]` cập nhật dữ liệu vào PostgreSQL Neon và đồng bộ lại IndexedDB cục bộ.

---

## 2. Phân Hệ 2: Hệ Thống Tài Khoản & Đăng Nhập (User Authentication) — *MỚI BỔ SUNG*

### 2.1. Mục tiêu
Giúp người dùng lưu trữ vĩnh viễn và đồng bộ danh sách bộ đề thi của mình trên mọi thiết bị (điện thoại, laptop, tablet), không còn phụ thuộc vào bộ nhớ tạm `IndexedDB` của riêng một trình duyệt.

### 2.2. Giải pháp kỹ thuật
- Sử dụng **Auth.js (NextAuth.js v5)** tương thích hoàn hảo với Next.js 15 App Router.
- **Phương thức đăng nhập:**
  - 🔑 **Google Login (Khuyên dùng):** Đăng nhập 1-click bằng tài khoản Google, không cần nhớ mật khẩu.
  - 🐱 **GitHub Login:** Phù hợp cho lập trình viên và sinh viên ngành IT.
  - ✉️ **Magic Link / Email (Tùy chọn):** Đăng nhập qua link gửi về email.
- **Mô hình linh hoạt (Hybrid Mode):**
  - **Khách vãng lai (Guest):** Vẫn được phép vào làm bài và tạo đề tức thì mà không bị ép buộc đăng nhập.
  - **Người dùng đã đăng nhập:** Bộ đề tạo ra tự động gắn với tài khoản của họ, xuất hiện trong trang **"Bộ Đề Của Tôi" (`/my-quizzes`)** để dễ dàng sửa, xóa và theo dõi lượt chơi.

---

## 3. Phân Hệ 3: Trang Quản Trị & Thống Kê Mini (`/admin`)

### 3.1. Mục tiêu
Cung cấp cho chủ sở hữu website (Owner/Admin) công cụ trực quan để theo dõi sức khỏe hệ thống, lưu lượng người dùng, và quản lý toàn bộ các bộ đề thi trên nền tảng.

### 3.2. Cơ chế bảo mật truy cập Admin
- **Giải pháp:** Sử dụng **Admin Secret PIN / Passphrase** được bảo vệ bởi biến môi trường `ADMIN_SECRET_KEY` trên Vercel.
- **Quy trình:**
  - Khi truy cập `/admin`, nếu chưa đăng nhập, giao diện hiển thị màn hình nhập mã PIN bảo mật.
  - Sau khi nhập đúng, hệ thống lưu session token an toàn vào **HTTP-only Cookie** với thời hạn 24 giờ.
  - Mọi API nội bộ (`/api/admin/*`) đều kiểm tra token này trước khi trả dữ liệu.

### 3.3. Các chỉ số thống kê cốt lõi (KPI Dashboard)
- 📊 **Tổng số bộ đề thi:** Đếm tổng số quiz đã lưu trên PostgreSQL Neon.
- ❓ **Tổng số câu hỏi trắc nghiệm:** Tổng lượng câu hỏi đang lưu trữ.
- 🎯 **Tổng lượt làm bài thi:** Tổng số lần người dùng hoàn thành các bài thi (`playCount`).
- 👥 **Số người dùng đăng ký:** Đếm tổng số tài khoản (khi có Auth).
- 📈 **Đề thi thịnh hành:** Top 5 bộ đề có số lượt làm bài cao nhất.
- ⏱️ **Hoạt động mới (Recent Activity):** Các bộ đề vừa được tạo trong 24 giờ qua.

### 3.4. Tính năng Quản lý Bộ đề (Quiz Management)
- Bảng danh sách đề thi phân trang (Pagination & Search): Tìm kiếm theo tiêu đề hoặc mã `shareCode`.
- Nút **Xem nhanh câu hỏi** (Quick Preview Modal) để kiểm duyệt nội dung.
- Nút **Sửa đề trực tiếp** (Edit Quiz): Chuyển sang form chỉnh sửa.
- Nút **Xóa đề rác/spam** (Delete Quiz): Xóa vĩnh viễn đề thi và các câu hỏi liên quan (`onDelete: Cascade`).

---

## 4. Phân Hệ 4: Bảo Mật, Chống Spam & Giới Hạn Tần Suất (Security & Rate Limiting)

### 4.1. Giới hạn tần suất tạo đề (Rate Limiting)
- Áp dụng Middleware Rate Limit theo IP: Tối đa **5 lượt tạo đề trong vòng 10 phút / IP**.
- Trả về mã lỗi `429 Too Many Requests` kèm thông báo thân thiện: *"Bạn đã tạo quá số đề cho phép, vui lòng thử lại sau vài phút."*

### 4.2. Kiểm soát kích thước tải trọng (Payload Validation)
- Giới hạn mỗi đề thi tối đa **200 câu hỏi** và độ dài tiêu đề tối đa 255 ký tự để bảo vệ RAM serverless.
- Tự động lọc thẻ HTML độc hại (Sanitization) trong nội dung câu hỏi và đáp án.

---

## 5. Phân Hệ 5: Nâng Cao Trải Nghiệm Làm Bài (User Experience)

### 5.1. Chế độ Thời Gian Làm Bài (Countdown Timer)
- Khi tạo hoặc sửa đề, có thể chọn: **Tự do (Không giới hạn)** hoặc **Hẹn giờ** (VD: 15 phút, 30 phút hoặc 60 giây/câu).
- Đồng hồ đếm ngược hiển thị ở góc màn hình thi. Khi hết giờ, hệ thống tự động nộp bài và tính điểm.

### 5.2. Hiệu Ứng Âm Thanh Tương Tác (Sound Effects)
- Thêm âm thanh khi chọn đúng (ding) và khi chọn sai (buzz).
- Có nút bật/tắt âm thanh (Mute/Unmute) tiện lợi ngay trên thanh công cụ làm bài.

### 5.3. Xuất Chứng Nhận & Kết Quả (Shareable Certificate Card)
- Sau khi hoàn thành bài thi, bên cạnh điểm số và pháo hoa, bổ sung nút **"Tải ảnh kết quả"** để người dùng chia sẻ lên Facebook, Zalo, Story.

---

## 6. Phân Hệ 6: Tối Ưu Chia Sẻ Mạng Xã Hội (Dynamic OpenGraph Preview)

- Tự động sinh ảnh preview khi chia sẻ đường link `https://quickquiz-omega.vercel.app/quiz/[CODE]` lên mạng xã hội.
- Người nhận khi thấy link trên Zalo/Messenger/Facebook sẽ nhìn thấy ảnh bìa chứa tiêu đề đề thi in đậm và số lượng câu hỏi.

---

## 7. Đề Xuất Điều Chỉnh Cơ Sở Dữ Liệu (Database Schema)

> ⚠️ **LƯU Ý QUY TẮC DATABASE:** Trước khi thực thi bất kỳ thay đổi nào dưới đây, bắt buộc phải có sự xác nhận của người dùng.

### 7.1. Bổ sung trường cho bảng `quizzes`
- `user_id`: ID người tạo (kiểu `String?`, NULL nếu là khách vãng lai).
- `edit_passcode`: Mã bảo vệ sửa đề nếu tạo ở chế độ khách (kiểu `String?`).
- `time_limit`: Số phút làm bài (kiểu `Int?`, NULL nghĩa là không giới hạn).

### 7.2. Bổ sung bảng `users` (Cho tính năng Đăng nhập)
```prisma
model User {
  id            String    @id @default(uuid())
  name          String?
  email         String    @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  quizzes       Quiz[]

  @@map("users")
}
```

---

## 8. Lộ Trình Triển Khai (Roadmap Cập Nhật)

| Giai Đoạn | Mục Tiêu Chính | Độ Ưu Tiên | Dự Kiến Thực Hiện |
| :--- | :--- | :---: | :---: |
| **Phase 1** | **Chức năng Sửa Bộ Đề (`/quiz/[code]/edit`)**: Cho phép mở lại đề thi, chỉnh sửa câu hỏi/đáp án/tiêu đề và lưu cập nhật vào Neon DB. | 🔴 Khẩn cấp | **Làm ngay** |
| **Phase 2** | **Trang Admin Mini (`/admin`)**: Đăng nhập PIN, Dashboard thống kê (tổng đề, tổng câu, lượt chơi), danh sách quản lý & xóa đề rác. | 🔴 Cao nhất | Tiếp theo |
| **Phase 3** | **Hệ Thống Đăng Nhập (Auth.js Google Login)**: Quản lý "Bộ đề của tôi", đồng bộ đa thiết bị. | 🟡 Cao | Kế tiếp |
| **Phase 4** | **Bảo Mật & Chống Spam**: Rate limiting theo IP, kiểm soát payload. | 🟡 Trung bình | Sau Phase 3 |
| **Phase 5** | **Tính Năng Trải Nghiệm**: Countdown Timer, Sound FX, OpenGraph preview. | 🟢 Hoàn thiện | Cuối cùng |
