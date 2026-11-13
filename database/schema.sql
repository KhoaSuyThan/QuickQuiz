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

-- Bảng quản lý Bộ đề tổng hợp (Quiz Collections - chứa nhiều đề thi nhỏ bên trong)
CREATE TABLE IF NOT EXISTS quiz_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_code VARCHAR(10) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image TEXT,
    edit_passcode VARCHAR(50), -- Mã PIN bảo vệ quyền quản lý bộ đề tổng hợp
    is_public BOOLEAN NOT NULL DEFAULT TRUE, -- Công khai hoặc Riêng tư
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Tài khoản người tạo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_collections_share_code ON quiz_collections(share_code);
CREATE INDEX IF NOT EXISTS idx_quiz_collections_user_id ON quiz_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_collections_is_public ON quiz_collections(is_public);

-- Bảng quản lý đề thi trắc nghiệm (có thể độc lập hoặc thuộc bộ đề lớn)
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_code VARCHAR(10) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_questions INT NOT NULL DEFAULT 0,
    play_count INT NOT NULL DEFAULT 0,
    edit_passcode VARCHAR(50), -- Mã PIN bảo vệ quyền chỉnh sửa bộ đề
    is_public BOOLEAN NOT NULL DEFAULT TRUE, -- Trạng thái công khai (Public) hoặc riêng tư (Private)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Liên kết tài khoản người tạo
    collection_id UUID REFERENCES quiz_collections(id) ON DELETE SET NULL, -- Liên kết Bộ đề tổng hợp (nếu có)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hỗ trợ migration nếu bảng đã tồn tại
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS edit_passcode VARCHAR(50);
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES quiz_collections(id) ON DELETE SET NULL;

-- Chỉ mục tìm kiếm nhanh theo mã chia sẻ, người tạo, trạng thái công khai và bộ đề
CREATE INDEX IF NOT EXISTS idx_quizzes_share_code ON quizzes(share_code);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_public ON quizzes(is_public);
CREATE INDEX IF NOT EXISTS idx_quizzes_collection_id ON quizzes(collection_id);

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
