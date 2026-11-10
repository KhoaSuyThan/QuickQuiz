-- Bảng người dùng hệ thống (Tài khoản & Phân quyền)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER', -- 'USER' hoặc 'ADMIN'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Bảng quản lý bộ đề trắc nghiệm
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_code VARCHAR(10) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_questions INT NOT NULL DEFAULT 0,
    play_count INT NOT NULL DEFAULT 0,
    edit_passcode VARCHAR(50), -- Mã PIN bảo vệ quyền chỉnh sửa bộ đề
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Liên kết tài khoản người tạo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hỗ trợ migration nếu bảng đã tồn tại
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS edit_passcode VARCHAR(50);
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Chỉ mục tìm kiếm nhanh theo mã chia sẻ và người tạo
CREATE INDEX IF NOT EXISTS idx_quizzes_share_code ON quizzes(share_code);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);

-- Bảng lưu trữ danh sách câu hỏi và các lựa chọn
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Mảng 3-6 đáp án: [{"id": "1", "text": "Hà Nội", "is_correct": true}, ...]
    explanation TEXT,
    order_index INT NOT NULL DEFAULT 0
);

-- Chỉ mục truy vấn câu hỏi theo bộ đề
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
