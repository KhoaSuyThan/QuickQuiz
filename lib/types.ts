// Định nghĩa các kiểu dữ liệu sử dụng trong FastQuiz

export interface QuizOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  id?: string;
  questionText: string;
  options: QuizOption[];
  explanation?: string;
  orderIndex?: number;
}

export interface QuizData {
  id?: string;
  shareCode?: string;
  title: string;
  description?: string;
  totalQuestions: number;
  playCount?: number;
  editPasscode?: string; // Mã PIN bảo mật chỉnh sửa
  isOwner?: boolean;
  canDelete?: boolean;
  createdAt?: string;
  questions: QuizQuestion[];
}

// Kiểu dữ liệu lưu trữ lịch sử làm bài trong IndexedDB
export interface QuizAttemptRecord {
  id: string; // UUID của lượt làm
  quizId?: string;
  shareCode?: string;
  quizTitle: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  completedAt: string;
  // Danh sách các câu làm sai để phục vụ tính năng "Chỉ làm lại câu sai"
  wrongQuestions: QuizQuestion[];
  // Dữ liệu toàn bộ câu hỏi của đề (phục vụ làm lại toàn bộ)
  allQuestions: QuizQuestion[];
}

// Kiểu dữ liệu bộ đề lưu trong IndexedDB (Local Quizzes)
export interface LocalSavedQuiz {
  id: string;
  shareCode?: string;
  title: string;
  description?: string;
  totalQuestions: number;
  editPasscode?: string; // Mã PIN chỉnh sửa lưu cục bộ
  createdAt: string;
  questions: QuizQuestion[];
}
