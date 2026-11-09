"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllAttempts, getAllLocalQuizzes } from "@/lib/storage";
import { QuizAttemptRecord, LocalSavedQuiz } from "@/lib/types";
import { History, Calendar, CheckCircle2, XCircle, RotateCcw, AlertTriangle, ArrowRight, BookOpen } from "lucide-react";
import QuizRunner from "@/components/QuizRunner";

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<QuizAttemptRecord[]>([]);
  const [myQuizzes, setMyQuizzes] = useState<LocalSavedQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  // State nếu người dùng chọn "Làm lại riêng câu sai" trực tiếp từ trang Lịch sử
  const [activeRetryAttempt, setActiveRetryAttempt] = useState<QuizAttemptRecord | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [attList, qList] = await Promise.all([
          getAllAttempts(),
          getAllLocalQuizzes(),
        ]);
        setAttempts(attList);
        setMyQuizzes(qList);
      } catch (err) {
        console.error("Lỗi khi tải lịch sử:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (activeRetryAttempt) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveRetryAttempt(null)}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5"
        >
          ← Quay lại danh sách lịch sử
        </button>
        <QuizRunner
          quizData={{
            title: activeRetryAttempt.quizTitle + " (Ôn Lại Câu Sai)",
            shareCode: activeRetryAttempt.shareCode,
            totalQuestions: activeRetryAttempt.wrongQuestions.length,
            questions: activeRetryAttempt.wrongQuestions,
          }}
          initialWrongQuestions={activeRetryAttempt.wrongQuestions}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-pop">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <History className="w-7 h-7 text-blue-600" />
          <span>Lịch Sử Làm Bài & Bộ Đề Của Bạn</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Dữ liệu được lưu trữ trực tiếp và bảo mật trong trình duyệt của bạn (IndexedDB).
        </p>
      </div>

      {/* Danh sách các lần thi đã làm */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Lịch sử các lần làm bài ({attempts.length})
        </h2>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">Đang đọc dữ liệu...</div>
        ) : attempts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500 space-y-2">
            <p>Bạn chưa hoàn thành bài thi trắc nghiệm nào.</p>
            <Link href="/" className="font-semibold text-blue-600 hover:underline">
              Làm bài ngay tại Trang Chủ
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(attempt.completedAt).toLocaleString("vi-VN")}
                    </span>
                    {attempt.shareCode && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-600 dark:text-slate-300">
                        {attempt.shareCode}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {attempt.quizTitle}
                  </h3>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {attempt.correctCount} câu đúng
                    </span>
                    <span className="flex items-center gap-1 text-rose-500 font-semibold">
                      <XCircle className="w-3.5 h-3.5" /> {attempt.wrongCount} câu sai
                    </span>
                  </div>
                </div>

                {/* Tỷ lệ % và các nút làm lại */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right sm:pr-2">
                    <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {attempt.percentage}%
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium">Tỷ lệ chính xác</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {attempt.wrongCount > 0 && (
                      <button
                        onClick={() => setActiveRetryAttempt(attempt)}
                        className="px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Làm lại {attempt.wrongCount} câu sai</span>
                      </button>
                    )}

                    <Link
                      href={`/quiz/${attempt.shareCode || "DEMO101"}`}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Làm lại</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Danh sách các đề đã tạo trên máy */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Danh sách bộ đề bạn đã lưu trên máy ({myQuizzes.length})</span>
        </h2>

        {myQuizzes.length === 0 ? (
          <p className="text-xs text-slate-500">Chưa có bộ đề nào được lưu trên máy.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myQuizzes.map((q) => (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{q.title}</h4>
                  <span className="text-[11px] text-slate-400">
                    Mã: {q.shareCode} • {q.totalQuestions} câu hỏi
                  </span>
                </div>
                <Link
                  href={`/quiz/${q.shareCode || q.id}`}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Mở đề</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
