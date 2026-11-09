# QuickQuiz - Nền Tảng Trắc Nghiệm Tức Thì & Chia Sẻ Đề Thi

QuickQuiz là ứng dụng web trắc nghiệm hiện đại, tối ưu hóa để triển khai trọn gói trên **Vercel**, kết hợp kiến trúc **PostgreSQL** trên Cloud (Vercel Postgres, Supabase, Neon) và **IndexedDB** cục bộ trên trình duyệt người dùng.

---

## ⚡ Tính Năng Nổi Bật

1. **Nhập dữ liệu đề thi linh hoạt:**
   - **Dán văn bản thô (Text):** Hỗ trợ cú pháp tự nhiên, đặt dấu `*` trước đáp án đúng (VD: `*A. Hà Nội`), nhận diện từ **3 đến 6 lựa chọn**.
   - **Tải lên File:** Hỗ trợ file Excel (`.xlsx`) và `.csv`.
   - **Xem trước trực tiếp (Live Preview):** Kiểm tra và lọc câu hỏi hợp lệ trước khi tạo đề.
2. **Instant Feedback (Phản hồi tức thì):**
   - Click chọn đáp án biết ngay Đúng (Xanh lá) hoặc Sai (Đỏ kèm chỉ ra đáp án đúng).
   - Hiển thị giải thích chi tiết ngay bên dưới câu hỏi.
3. **Xáo trộn thông minh (Fisher-Yates Shuffle):**
   - Xáo trộn ngẫu nhiên thứ tự câu hỏi và thứ tự các đáp án A/B/C/D ở mỗi lượt thi.
   - Cho phép người dùng tùy chọn số lượng câu muốn làm (VD: ngân hàng 100 câu, chọn ngẫu nhiên 20 câu để thi).
4. **Tổng kết & Chế độ ôn tập chuyên sâu:**
   - Thống kê tỷ lệ %, số câu đúng/sai, hiệu ứng pháo hoa ăn mừng khi đạt điểm cao.
   - **Trộn bài & Làm lại toàn bộ:** Khởi động lượt thi mới hoàn toàn ngẫu nhiên.
   - **Chỉ làm lại những câu sai:** Tách riêng danh sách các câu đã làm sai để luyện tập lại cho đến khi thành thạo.
5. **Lưu trữ thông minh không cần đăng nhập:**
   - Bộ đề được lưu lên Cloud PostgreSQL sinh mã chia sẻ ngắn (VD: `DEMO101`, `QZ8F2K`) để bạn bè cùng làm.
   - Lịch sử làm bài và danh sách đề thi cá nhân lưu tự động vào **IndexedDB** của trình duyệt.

---

## 🚀 Hướng Dẫn Chạy Ứng Dụng (Getting Started)

### Cách 1: Chạy Ngay Siêu Nhanh (Không Cần Cài Đặt Database)
> 💡 Ứng dụng đã được thiết kế sẵn chế độ **Local Fallback**: Nếu chưa có chuỗi kết nối PostgreSQL, hệ thống sẽ tự động dùng **IndexedDB** trên máy của bạn và có sẵn bộ đề mẫu `DEMO101` để trải nghiệm đầy đủ 100% tính năng.

1. **Cài đặt các gói phụ thuộc:**
   ```powershell
   npm install
   ```

2. **Khởi chạy máy chủ phát triển:**
   ```powershell
   npm run dev
   ```

3. Mở trình duyệt và truy cập: **`http://localhost:3000`**
   - Nhập mã `DEMO101` để làm thử đề mẫu.
   - Hoặc bấm vào **"Tạo Đề Mới"** để dán văn bản / tải file Excel của riêng bạn.

---

### Cách 2: Chạy Đầy Đủ Kết Nối PostgreSQL (Cloud hoặc Local)

1. **Tạo file cấu hình `.env`:**
   Sao chép từ file mẫu:
   ```powershell
   cp .env.example .env
   ```
   Điền chuỗi kết nối PostgreSQL của bạn (Supabase, Neon, Vercel Postgres hoặc PostgreSQL Local):
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/fastquiz?schema=public"
   ```

2. **Đồng bộ bảng dữ liệu vào PostgreSQL:**
   ```powershell
   npx prisma db push
   ```

3. **(Tùy chọn) Nạp dữ liệu đề mẫu vào Database:**
   ```powershell
   npm run seed
   ```

4. **Khởi chạy ứng dụng:**
   ```powershell
   npm run dev
   ```

---

## ☁️ Triển Khai Lên Vercel (Deployment Guide)

1. Đẩy toàn bộ mã nguồn lên GitHub của bạn:
   ```bash
   git init
   git add .
   git commit -m "Initial commit QuickQuiz"
   git push origin main
   ```

2. Truy cập [Vercel](https://vercel.com) -> Chọn **"Add New Project"** -> Import repository vừa tạo.

3. Tạo PostgreSQL miễn phí trên Vercel:
   - Vào tab **Storage** trên Vercel -> Chọn **Postgres** (hỗ trợ bởi Neon).
   - Vercel sẽ tự động tạo và liên kết biến môi trường `DATABASE_URL`.
   - *(Hoặc bạn có thể dán `DATABASE_URL` từ Supabase vào mục **Environment Variables**).*

4. Nhấn **Deploy**: Vercel sẽ tự động build và cấp phát tên miền truy cập miễn phí (`https://your-app.vercel.app`).

---

## 📝 Quy Định Cú Pháp Nhập Đề Thi

### 1. Dán văn bản trực tiếp (Text format):
Mỗi câu hỏi cách nhau bởi một dòng trống. Đặt dấu `*` trước đáp án đúng:
```text
Câu 1: Thủ đô của Việt Nam là gì?
*A. Hà Nội
B. Đà Nẵng
C. TP. Hồ Chí Minh
D. Cần Thơ
Giải thích: Hà Nội là thủ đô của nước CHXHCN Việt Nam.

Câu 2: Số nguyên tố chẵn duy nhất trong toán học là?
A. 0
*B. 2
C. 4
```

### 2. File Excel (`.xlsx`) hoặc CSV (`.csv`):
Cấu trúc các cột tính từ trái sang phải:
- **Cột 1:** Nội dung câu hỏi (`Question`)
- **Cột 2:** Đáp án đúng (`CorrectAnswer`)
- **Cột 3 -> Cột 7:** Các lựa chọn sai (`Option 1` đến `Option 5`)

---

## 📂 Cấu Trúc Dự Án

```text
QuickQuiz/
├── app/
│   ├── api/
│   │   └── quizzes/           # API Serverless tạo và lấy câu hỏi theo mã
│   ├── create/                # Trang tạo đề thi (Upload file / Nhập text)
│   ├── history/               # Trang xem lịch sử thi & ôn lại câu sai
│   ├── quiz/[code]/           # Trang làm bài trắc nghiệm với instant feedback
│   ├── layout.tsx             # Layout chung, Navbar, Font chữ
│   └── page.tsx               # Trang chủ QuickQuiz
├── components/
│   ├── Navbar.tsx             # Thanh điều hướng & ô nhập nhanh mã đề
│   ├── QuizResult.tsx         # Tổng kết điểm số, thống kê %, ôn lại câu sai
│   ├── QuizRunner.tsx         # Trình xáo trộn & làm bài trắc nghiệm
│   └── Uploader.tsx           # Kéo thả file Excel/CSV & Preview trực tiếp
├── database/
│   ├── schema.sql             # Script SQL thuần khởi tạo PostgreSQL
│   └── seed.ts                # Dữ liệu trắc nghiệm mẫu
├── lib/
│   ├── parser.ts              # Xử lý đọc Text, CSV, Excel
│   ├── prisma.ts              # Kết nối cơ sở dữ liệu an toàn
│   ├── shuffle.ts             # Thuật toán xáo trộn câu & đáp án
│   ├── storage.ts             # Thao tác lưu trữ cục bộ IndexedDB
│   └── types.ts               # Định nghĩa TypeScript
├── prisma/
│   └── schema.prisma          # Prisma Schema định nghĩa Model
└── README.md
```
