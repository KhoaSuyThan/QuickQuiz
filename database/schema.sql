-- Bảng quản lý bộ đề trắc nghiệm
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_code VARCHAR(10) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_questions INT NOT NULL DEFAULT 0,
    play_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chỉ mục tìm kiếm nhanh theo mã chia sẻ
CREATE INDEX IF NOT EXISTS idx_quizzes_share_code ON quizzes(share_code);

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
