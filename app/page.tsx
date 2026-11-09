"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, PlusCircle, ArrowRight, BookOpen, Clock, Sparkles } from "lucide-react";
import { getAllLocalQuizzes } from "@/lib/storage";
import { LocalSavedQuiz } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [shareCodeInput, setShareCodeInput] = useState("");
  const [localQuizzes, setLocalQuizzes] = useState<LocalSavedQuiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);

  useEffect(() => {
    getAllLocalQuizzes()
      .then((data) => {
        setLocalQuizzes(data);
        setIsLoadingQuizzes(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoadingQuizzes(false);
      });
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareCodeInput.trim()) return;
    router.push(`/quiz/${shareCodeInput.trim().toUpperCase()}`);
  };

  return (
    <div className="space-y-12 py-4 animate-pop">
      {/* Hero Section */}
      <section className="text-center space-y-5 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Trắc nghiệm tức thì & Tối ưu cho Vercel</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Luyện Trắc Nghiệm Thông Minh,{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Instant Feedback
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Tải lên file Excel/CSV hoặc dán đề văn bản. Tự động xáo trộn ngẫu nhiên câu hỏi & đáp án, chấm điểm ngay lập tức và ôn lại riêng những câu sai.
        </p>

        {/* Khung nhập mã đề & Nút Tạo mới */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <form onSubmit={handleJoin} className="relative w-full">
            <input
              type="text"
              placeholder="Nhập mã đề (VD: DEMO101)..."
              value={shareCodeInput}
              onChange={(e) => setShareCodeInput(e.target.value)}
              className="w-full text-xs font-mono uppercase bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-4 pr-10 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <Link
            href="/create"
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo Đề Thi Mới</span>
          </Link>
        </div>
      </section>

      {/* Đề thi mẫu Demo trải nghiệm nhanh */}
      <section className="bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-purple-500/10 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-current" />
            <span>Thử nghiệm ngay không cần tạo đề</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Bộ Đề Mẫu: Kiến Thức Khoa Học & Xã Hội (5 Câu)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Trải nghiệm tính năng xáo trộn câu hỏi, đảo đáp án và instant feedback.
          </p>
        </div>
        <Link
          href="/quiz/DEMO101"
          className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-all hover:scale-105 flex items-center gap-1.5"
        >
          <span>Làm Thử Ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* Danh sách đề thi đã tạo trên máy này (IndexedDB) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Đề Thi Của Bạn Trên Máy Này
            </h2>
          </div>
          <span className="text-xs text-slate-500">Lưu trữ cục bộ an toàn</span>
        </div>

        {isLoadingQuizzes ? (
          <div className="text-center py-8 text-xs text-slate-400">Đang tải danh sách đề...</div>
        ) : localQuizzes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bạn chưa tạo bộ đề nào trên trình duyệt này.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Nhấn vào đây để tải lên bộ đề đầu tiên</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      {quiz.shareCode || "LOCAL"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {quiz.totalQuestions} câu hỏi
                  </span>
                  <Link
                    href={`/quiz/${quiz.shareCode || quiz.id}`}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Làm bài</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
