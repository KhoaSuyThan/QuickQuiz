"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { QuizQuestion } from "@/lib/types";
import { saveQuizAttempt } from "@/lib/storage";
import { Trophy, RotateCcw, AlertCircle, ArrowLeft, CheckCircle2, XCircle, Share2 } from "lucide-react";
import Link from "next/link";

interface QuizResultProps {
  quizTitle: string;
  shareCode?: string;
  totalAnswered: number;
  correctCount: number;
  wrongCount: number;
  wrongQuestions: QuizQuestion[];
  allQuestions: QuizQuestion[];
  onRetryAll: () => void;
  onRetryWrongOnly: () => void;
}

export default function QuizResult({
  quizTitle,
  shareCode,
  totalAnswered,
  correctCount,
  wrongCount,
  wrongQuestions,
  allQuestions,
  onRetryAll,
  onRetryWrongOnly,
}: QuizResultProps) {
  const percentage = Math.round((correctCount / (totalAnswered || 1)) * 100);

  // Tự động lưu kết quả vào IndexedDB khi trang kết quả xuất hiện
  useEffect(() => {
    const recordId = "attempt-" + Date.now();
    saveQuizAttempt({
      id: recordId,
      shareCode,
      quizTitle,
      totalQuestions: totalAnswered,
      correctCount,
      wrongCount,
      percentage,
      completedAt: new Date().toISOString(),
      wrongQuestions,
      allQuestions,
    }).catch(console.error);

    // Bắn hiệu ứng pháo hoa nếu đạt từ 80% trở lên
    if (percentage >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [quizTitle, shareCode, totalAnswered, correctCount, wrongCount, percentage, wrongQuestions, allQuestions]);

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép liên kết đề thi vào bộ nhớ tạm!");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-pop">
      {/* Thẻ vinh danh kết quả */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-lg space-y-4">
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
          percentage >= 80
            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
            : percentage >= 50
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
            : "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
        }`}>
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
            Tổng kết kết quả
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {quizTitle}
          </h1>
          {shareCode && (
            <p className="text-xs font-mono text-slate-500">Mã đề: {shareCode}</p>
          )}
        </div>

        {/* Điểm số & Tỷ lệ */}
        <div className="py-2">
          <div className="text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {percentage}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {percentage >= 80 ? "Xuất sắc! Bạn nắm kiến thức rất vững." : percentage >= 50 ? "Khá tốt! Hãy ôn lại những câu còn sai nhé." : "Cần cố gắng thêm! Hãy luyện tập lại các câu sai."}
          </p>
        </div>

        {/* Khung số liệu chi tiết */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="block text-[11px] font-semibold text-slate-500">Đã làm</span>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{totalAnswered}</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900">
            <span className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Đúng</span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{correctCount}</span>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-2xl border border-rose-200 dark:border-rose-900">
            <span className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400">Sai</span>
            <span className="text-lg font-bold text-rose-700 dark:text-rose-300">{wrongCount}</span>
          </div>
        </div>

        {/* Các nút hành động chính */}
        <div className="space-y-2.5 pt-4">
          <button
            onClick={onRetryAll}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Trộn Bài & Làm Lại Toàn Bộ</span>
          </button>

          {wrongCount > 0 && (
            <button
              onClick={onRetryWrongOnly}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Chỉ Trộn & Làm Lại {wrongCount} Câu Sai</span>
            </button>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleShareLink}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ đề này</span>
            </button>
            <Link
              href="/history"
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Xem lịch sử</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Danh sách các câu hỏi làm sai để người học xem lại ngay */}
      {wrongCount > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Danh sách {wrongCount} câu bạn đã trả lời sai
            </h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {wrongQuestions.map((q, idx) => {
              const correctOption = q.options.find((o) => o.is_correct);
              return (
                <div
                  key={idx}
                  className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-1.5 text-xs"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Câu {idx + 1}: {q.questionText}
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                    ✓ Đáp án đúng: {correctOption?.text || "Chưa xác định"}
                  </p>
                  {q.explanation && (
                    <p className="text-slate-500 italic text-[11px]">
                      💡 Giải thích: {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
