"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Zap, 
  PlusCircle, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Globe, 
  Lock, 
  UserCheck, 
  LogIn 
} from "lucide-react";
import { getAllLocalQuizzes, deleteLocalQuiz } from "@/lib/storage";

interface QuizDisplayItem {
  id: string;
  shareCode?: string;
  title: string;
  description?: string | null;
  totalQuestions: number;
  playCount?: number;
  isPublic?: boolean;
  createdAt: string;
  source: "account" | "local";
}

export default function HomePage() {
  const router = useRouter();
  const [shareCodeInput, setShareCodeInput] = useState("");
  const [userQuizzes, setUserQuizzes] = useState<QuizDisplayItem[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Tải danh sách đề thi: Gọi trực tiếp /api/quizzes/my để xác định trạng thái trong 1 request duy nhất (giảm 50% thời gian chờ)
  const loadQuizzes = async () => {
    setIsLoadingQuizzes(true);
    try {
      const myRes = await fetch("/api/quizzes/my");
      if (myRes.ok) {
        const myData = await myRes.json();
        setIsLoggedIn(true);
        const formatted: QuizDisplayItem[] = (myData.quizzes || []).map((q: any) => ({
          id: q.id,
          shareCode: q.shareCode,
          title: q.title,
          description: q.description,
          totalQuestions: q.totalQuestions,
          playCount: q.playCount,
          isPublic: q.isPublic ?? true,
          createdAt: q.createdAt,
          source: "account",
        }));
        setUserQuizzes(formatted);
        setIsLoadingQuizzes(false);
        return;
      }

      // Người dùng chưa đăng nhập (401): Lấy từ IndexedDB
      setIsLoggedIn(false);
      const localData = await getAllLocalQuizzes();
      const formattedLocal: QuizDisplayItem[] = localData.map((q) => ({
        id: q.id,
        shareCode: q.shareCode,
        title: q.title,
        description: q.description,
        totalQuestions: q.totalQuestions,
        isPublic: q.isPublic ?? true,
        createdAt: q.createdAt,
        source: "local",
      }));
      setUserQuizzes(formattedLocal);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đề thi:", err);
      const localData = await getAllLocalQuizzes().catch(() => []);
      setUserQuizzes(
        localData.map((q) => ({
          id: q.id,
          shareCode: q.shareCode,
          title: q.title,
          description: q.description,
          totalQuestions: q.totalQuestions,
          isPublic: q.isPublic ?? true,
          createdAt: q.createdAt,
          source: "local",
        }))
      );
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Xóa đề thi
  const handleDeleteQuiz = async (quiz: QuizDisplayItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bộ đề "${quiz.title}" không?`)) {
      return;
    }

    try {
      if (quiz.source === "account") {
        await fetch(`/api/quizzes/my?id=${quiz.id}`, { method: "DELETE" });
      } else {
        if (quiz.shareCode) {
          await fetch(`/api/quizzes/${quiz.shareCode}`, { method: "DELETE" }).catch(() => {});
        }
        await deleteLocalQuiz(quiz.id);
      }
      setUserQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
    } catch (err) {
      console.error("Lỗi khi xóa đề:", err);
      alert("Không thể xóa bộ đề này.");
    }
  };

  // Gạt chuyển nhanh trạng thái Công khai / Riêng tư ngay trên thẻ Card
  const handleTogglePublic = async (quiz: QuizDisplayItem) => {
    const newStatus = !quiz.isPublic;
    setTogglingId(quiz.id);

    // Cập nhật giao diện tức thì (Optimistic UI)
    setUserQuizzes((prev) =>
      prev.map((q) => (q.id === quiz.id ? { ...q, isPublic: newStatus } : q))
    );

    try {
      const codeToCall = quiz.shareCode || quiz.id;
      const res = await fetch(`/api/quizzes/${codeToCall}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: newStatus }),
      });

      if (!res.ok) {
        // Rollback nếu có lỗi
        setUserQuizzes((prev) =>
          prev.map((q) => (q.id === quiz.id ? { ...q, isPublic: !newStatus } : q))
        );
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Không thể cập nhật trạng thái");
      }
    } catch (err) {
      console.error("Lỗi khi chuyển trạng thái đề:", err);
      setUserQuizzes((prev) =>
        prev.map((q) => (q.id === quiz.id ? { ...q, isPublic: !newStatus } : q))
      );
    } finally {
      setTogglingId(null);
    }
  };

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
          <span>Trắc nghiệm tức thì & Kho đề chia sẻ cộng đồng</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Luyện Trắc Nghiệm Thông Minh,{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Instant Feedback
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Tải lên file Excel/CSV hoặc dán đề văn bản. Tự động xáo trộn ngẫu nhiên câu hỏi & đáp án, chấm điểm ngay lập tức và chia sẻ đề thi cho cộng đồng.
        </p>

        {/* Khung nhập mã đề & Nút Tạo mới & Xem Kho Đề */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <form onSubmit={handleJoin} suppressHydrationWarning className="relative w-full">
            <input
              type="text"
              placeholder="Nhập mã đề (VD: DEMO101)..."
              value={shareCodeInput}
              onChange={(e) => setShareCodeInput(e.target.value)}
              suppressHydrationWarning
              className="w-full text-xs font-mono uppercase bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-4 pr-10 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <button
              type="submit"
              aria-label="Vào làm bài"
              suppressHydrationWarning
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
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/community"
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>Kho Đề Thi</span>
          </Link>
          <Link
            href="/quiz/DEMO101"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <span>Làm Thử Ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Danh sách Đề Thi Của Bạn */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Đề thi của bạn
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {isLoadingQuizzes ? (
              // Giữ chỗ trong suốt để không bị giật giao diện hay chớp text
              <div className="h-4 w-36 opacity-0 pointer-events-none" />
            ) : isLoggedIn ? (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium animate-fadeIn">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Đồng bộ theo tài khoản</span>
                <Link href="/my-quizzes" className="text-blue-600 hover:underline ml-1">
                  (Quản lý tất cả)
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 animate-fadeIn">
                <span>Lưu tạm trên máy.</span>
                <Link
                  href="/login"
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Đăng nhập để lưu vĩnh viễn</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {isLoadingQuizzes ? (
          /* Skeleton Loading Cards giữ đúng bố cục không bị giật màn hình */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 animate-pulse shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="h-3 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : userQuizzes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isLoggedIn
                ? "Bạn chưa tạo bộ đề nào trên tài khoản này."
                : "Bạn chưa tạo bộ đề nào trên trình duyệt này."}
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
            {userQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                        {quiz.shareCode || "LOCAL"}
                      </span>

                      {/* Thanh gạt Public / Private ngay trên Card */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={quiz.isPublic}
                        disabled={togglingId === quiz.id}
                        onClick={() => handleTogglePublic(quiz)}
                        className={`relative inline-flex items-center h-6 rounded-full pl-1.5 pr-2.5 gap-1.5 text-[10px] font-bold border transition-all cursor-pointer shadow-2xs hover:scale-102 ${
                          quiz.isPublic
                            ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        }`}
                        title={`Nhấp để gạt sang ${quiz.isPublic ? "Riêng tư" : "Công khai"}`}
                      >
                        {/* Thanh trượt slider mini chuẩn */}
                        <div
                          className={`w-8 h-4.5 rounded-full transition-colors flex items-center p-0.5 ${
                            quiz.isPublic ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                              quiz.isPublic ? "translate-x-3.5" : "translate-x-0"
                            }`}
                          />
                        </div>
                        <span>{quiz.isPublic ? "Công khai" : "Riêng tư"}</span>
                      </button>
                    </div>
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
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDeleteQuiz(quiz)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Xóa bộ đề này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/quiz/${quiz.shareCode || quiz.id}/edit`}
                      className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Chỉnh sửa câu hỏi bộ đề này"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </Link>
                    <Link
                      href={`/quiz/${quiz.shareCode || quiz.id}`}
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 pl-1"
                    >
                      <span>Làm bài</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
