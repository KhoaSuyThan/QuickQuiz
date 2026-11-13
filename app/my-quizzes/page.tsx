"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BookMarked, 
  PlusCircle, 
  Play, 
  Edit3, 
  Trash2, 
  Clock, 
  Loader2, 
  AlertCircle,
  ArrowRight,
  UserCheck,
  Globe,
  Lock,
  Layers
} from "lucide-react";

interface MyQuizItem {
  id: string;
  shareCode: string;
  title: string;
  description: string | null;
  totalQuestions: number;
  playCount: number;
  isPublic?: boolean;
  createdAt: string;
  isCollection?: boolean;
  subQuizCount?: number;
}

export default function MyQuizzesPage() {
  const [quizzes, setQuizzes] = useState<MyQuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchMyQuizzes = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/quizzes/my");
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setErrorMsg("Vui lòng đăng nhập để xem danh sách bộ đề của bạn.");
        } else {
          setErrorMsg(data.error || "Không thể tải bộ đề.");
        }
        return;
      }

      setQuizzes(data.quizzes || []);
    } catch (err: any) {
      setErrorMsg("Lỗi khi kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQuizzes();
  }, []);

  const handleDeleteQuiz = async (quiz: MyQuizItem) => {
    const isColl = quiz.isCollection;
    const confirmText = isColl
      ? `Bạn có chắc chắn muốn xóa bộ đề tổng hợp "${quiz.title}" không? Hành động này không thể hoàn tác!`
      : `Bạn có chắc chắn muốn xóa đề thi "${quiz.title}" không? Hành động này không thể hoàn tác!`;

    if (!window.confirm(confirmText)) {
      return;
    }

    setDeletingId(quiz.id);
    try {
      const url = isColl
        ? `/api/quizzes/my?id=${quiz.id}&isCollection=true`
        : `/api/quizzes/my?id=${quiz.id}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Không thể xóa đề");
        return;
      }

      setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
    } catch (err) {
      alert("Lỗi máy chủ khi xóa đề");
    } finally {
      setDeletingId(null);
    }
  };

  // Gạt chuyển nhanh trạng thái Công khai / Riêng tư ngay trên thẻ Card
  const handleTogglePublic = async (quiz: MyQuizItem) => {
    const newStatus = quiz.isPublic === false ? true : false;
    setTogglingId(quiz.id);

    // Cập nhật giao diện tức thì (Optimistic UI)
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quiz.id ? { ...q, isPublic: newStatus } : q))
    );

    try {
      const endpoint = quiz.isCollection
        ? `/api/collections/${quiz.shareCode || quiz.id}`
        : `/api/quizzes/${quiz.shareCode || quiz.id}`;
      const method = quiz.isCollection ? "PUT" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: newStatus }),
      });

      if (!res.ok) {
        // Rollback nếu có lỗi
        setQuizzes((prev) =>
          prev.map((q) => (q.id === quiz.id ? { ...q, isPublic: !newStatus } : q))
        );
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Không thể cập nhật trạng thái");
      }
    } catch (err) {
      console.error("Lỗi khi chuyển trạng thái đề:", err);
      setQuizzes((prev) =>
        prev.map((q) => (q.id === quiz.id ? { ...q, isPublic: !newStatus } : q))
      );
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Đang tải danh sách bộ đề của bạn...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-pop">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{errorMsg}</h2>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md"
          >
            <span>Đăng Nhập Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pop pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookMarked className="w-7 h-7 text-blue-600" />
            <span>Bộ Đề Của Tôi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Được lưu trữ vĩnh viễn trên tài khoản đám mây của bạn ({quizzes.length} bộ đề)
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo Đề Mới</span>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <BookMarked className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Bạn chưa tạo bộ đề nào với tài khoản này
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hãy tạo đề thi trắc nghiệm đầu tiên của bạn bằng cách tải file hoặc dán nội dung văn bản.
            </p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo Bộ Đề Đầu Tiên</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => {
            const isColl = quiz.isCollection;

            return (
              <div
                key={quiz.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group ${
                  isColl
                    ? "border-purple-200 dark:border-purple-900/60 hover:border-purple-400 dark:hover:border-purple-700 bg-gradient-to-b from-purple-50/20 to-transparent dark:from-purple-950/10"
                    : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      {isColl ? (
                        <span className="inline-flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                          <Layers className="w-3 h-3" />
                          <span>Bộ tổng hợp</span>
                        </span>
                      ) : (
                        <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                          {quiz.shareCode}
                        </span>
                      )}

                      {/* Thanh gạt Public / Private ngay trên Card */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={quiz.isPublic !== false}
                        disabled={togglingId === quiz.id}
                        onClick={() => handleTogglePublic(quiz)}
                        className={`relative inline-flex items-center h-6 rounded-full pl-1.5 pr-2.5 gap-1.5 text-[10px] font-bold border transition-all cursor-pointer shadow-2xs hover:scale-102 ${
                          quiz.isPublic !== false
                            ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        }`}
                        title={`Nhấp để gạt sang ${quiz.isPublic !== false ? "Riêng tư" : "Công khai"}`}
                      >
                        {/* Thanh trượt slider mini chuẩn */}
                        <div
                          className={`w-8 h-4.5 rounded-full transition-colors flex items-center p-0.5 ${
                            quiz.isPublic !== false ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                              quiz.isPublic !== false ? "translate-x-3.5" : "translate-x-0"
                            }`}
                          />
                        </div>
                        <span>{quiz.isPublic !== false ? "Công khai" : "Riêng tư"}</span>
                      </button>
                    </div>

                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold line-clamp-2 transition-colors ${
                    isColl
                      ? "text-slate-900 dark:text-white group-hover:text-purple-600"
                      : "text-slate-900 dark:text-white group-hover:text-blue-600"
                  }`}>
                    {quiz.title}
                  </h3>

                  {quiz.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400">
                    {isColl ? (
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {quiz.subQuizCount || 0} đề thi nhỏ • {quiz.totalQuestions} câu hỏi
                      </span>
                    ) : (
                      <span>
                        {quiz.totalQuestions} câu hỏi • {quiz.playCount} lượt làm
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {isColl ? (
                      <Link
                        href={`/collection/${quiz.shareCode}`}
                        className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                        title="Quản lý và chỉnh sửa các đề nhỏ bên trong"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa đề con</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/quiz/${quiz.shareCode}/edit`}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                        title="Chỉnh sửa đề thi"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      disabled={deletingId === quiz.id}
                      onClick={() => handleDeleteQuiz(quiz)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title={isColl ? "Xóa bộ đề tổng hợp này" : "Xóa đề thi này"}
                    >
                      {deletingId === quiz.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {isColl ? (
                    <Link
                      href={`/collection/${quiz.shareCode}`}
                      className="font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <span>Vào xem</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href={`/quiz/${quiz.shareCode}`}
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Vào thi</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
