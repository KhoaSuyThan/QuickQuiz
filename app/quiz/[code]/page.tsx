"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { QuizData } from "@/lib/types";
import { getAllLocalQuizzes } from "@/lib/storage";
import QuizRunner from "@/components/QuizRunner";
import { Loader2, AlertCircle, ArrowLeft, PlusCircle } from "lucide-react";

// Bộ đề mẫu tích hợp sẵn cho mã DEMO101
const DEMO_QUIZ_DATA: QuizData = {
  id: "demo-101",
  shareCode: "DEMO101",
  title: "Bộ Đề Mẫu Trắc Nghiệm Kiến Thức Chung",
  description: "Đề thi mẫu gồm 5 câu hỏi kiểm tra khả năng xáo trộn và chấm điểm tức thì.",
  totalQuestions: 5,
  questions: [
    {
      questionText: "Thủ đô của Việt Nam là thành phố nào?",
      orderIndex: 1,
      explanation: "Hà Nội là thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.",
      options: [
        { id: "1", text: "Hà Nội", is_correct: true },
        { id: "2", text: "TP. Hồ Chí Minh", is_correct: false },
        { id: "3", text: "Đà Nẵng", is_correct: false },
        { id: "4", text: "Hải Phòng", is_correct: false },
      ],
    },
    {
      questionText: "Số nguyên tố chẵn duy nhất trong toán học là số nào?",
      orderIndex: 2,
      explanation: "Số 2 là số nguyên tố duy nhất chia hết cho 2.",
      options: [
        { id: "1", text: "0", is_correct: false },
        { id: "2", text: "2", is_correct: true },
        { id: "3", text: "4", is_correct: false },
        { id: "4", text: "6", is_correct: false },
      ],
    },
    {
      questionText: "Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?",
      orderIndex: 3,
      explanation: "Sao Thủy (Mercury) là hành tinh nằm gần Mặt Trời nhất.",
      options: [
        { id: "1", text: "Sao Hỏa", is_correct: false },
        { id: "2", text: "Sao Kim", is_correct: false },
        { id: "3", text: "Sao Thủy", is_correct: true },
        { id: "4", text: "Trái Đất", is_correct: false },
        { id: "5", text: "Sao Mộc", is_correct: false },
      ],
    },
    {
      questionText: "Đâu là ngôn ngữ lập trình chạy trực tiếp trên trình duyệt web?",
      orderIndex: 4,
      explanation: "JavaScript là ngôn ngữ kịch bản tiêu chuẩn chạy trên các trình duyệt.",
      options: [
        { id: "1", text: "Python", is_correct: false },
        { id: "2", text: "C++", is_correct: false },
        { id: "3", text: "JavaScript", is_correct: true },
        { id: "4", text: "Java", is_correct: false },
      ],
    },
    {
      questionText: "Quốc gia nào có diện tích lớn nhất thế giới?",
      orderIndex: 5,
      explanation: "Liên bang Nga có diện tích khoảng 17,1 triệu km2, lớn nhất thế giới.",
      options: [
        { id: "1", text: "Canada", is_correct: false },
        { id: "2", text: "Nga", is_correct: true },
        { id: "3", text: "Mỹ", is_correct: false },
        { id: "4", text: "Trung Quốc", is_correct: false },
      ],
    },
  ],
};

export default function QuizPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const code = resolvedParams.code.toUpperCase();

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadQuiz() {
      // 1. Nếu là mã đề mẫu
      if (code === "DEMO101") {
        setQuizData(DEMO_QUIZ_DATA);
        setLoading(false);
        return;
      }

      // 2. Thử tìm kiếm trong cơ sở dữ liệu cục bộ IndexedDB trên máy
      try {
        const localList = await getAllLocalQuizzes();
        const foundLocal = localList.find(
          (q) => q.shareCode?.toUpperCase() === code || q.id === code
        );

        if (foundLocal) {
          setQuizData(foundLocal);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Không thể đọc từ IndexedDB:", e);
      }

      // 3. Nếu không có ở IndexedDB, truy vấn Serverless PostgreSQL qua API
      try {
        const res = await fetch(`/api/quizzes/${code}`);
        const data = await res.json();

        if (res.ok && data.quiz) {
          setQuizData(data.quiz);
        } else {
          setError(data.error || "Không tìm thấy bộ đề trắc nghiệm này.");
        }
      } catch (err: any) {
        setError("Không thể kết nối đến máy chủ lấy đề thi.");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [code]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu câu hỏi...</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-sm animate-pop">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Không Tìm Thấy Đề</h2>
          <p className="text-xs text-slate-500">{error || "Bộ đề trắc nghiệm không tồn tại hoặc đã bị xóa."}</p>
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/create"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo đề thi mới ngay</span>
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <QuizRunner quizData={quizData} />
    </div>
  );
}
