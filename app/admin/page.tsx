"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  HelpCircle, 
  BookOpen, 
  Play, 
  Users, 
  Search, 
  Trash2, 
  Edit3, 
  Loader2, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
  KeyRound
} from "lucide-react";

interface AdminStats {
  totalQuizzes: number;
  totalQuestions: number;
  totalUsers: number;
  totalPlays: number;
  recentQuizzes: any[];
  topQuizzes: any[];
}

interface AdminQuizItem {
  id: string;
  shareCode: string;
  title: string;
  description: string | null;
  totalQuestions: number;
  playCount: number;
  editPasscode: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [quizzes, setQuizzes] = useState<AdminQuizItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      // 1. Tải số liệu thống kê
      const [resStats, resQuizzes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/admin/quizzes?search=${encodeURIComponent(searchQuery)}`),
      ]);

      const dataStats = await resStats.json();
      const dataQuizzes = await resQuizzes.json();

      if (!resStats.ok) {
        if (resStats.status === 403) {
          setErrorMsg("Truy cập bị từ chối! Bạn không có quyền quản trị viên (Admin).");
        } else {
          setErrorMsg(dataStats.error || "Không thể tải số liệu thống kê");
        }
        return;
      }

      setStats(dataStats.stats);
      if (resQuizzes.ok) {
        setQuizzes(dataQuizzes.quizzes || []);
      }
    } catch (err: any) {
      setErrorMsg("Lỗi khi kết nối đến máy chủ quản trị.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [searchQuery]);

  const handleDeleteQuiz = async (id: string, title: string) => {
    if (!window.confirm(`[ADMIN] Bạn có chắc chắn muốn xóa vĩnh viễn đề thi "${title}" không?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/quizzes?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Không thể xóa đề thi");
        return;
      }

      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      if (stats) {
        setStats({ ...stats, totalQuizzes: Math.max(stats.totalQuizzes - 1, 0) });
      }
    } catch (err) {
      alert("Lỗi máy chủ khi xóa đề");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Đang tải dữ liệu Bảng Điều Khiển Admin...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-pop">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shadow-lg">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Không Có Quyền Truy Cập</h2>
          <p className="text-xs text-slate-500">{errorMsg}</p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md"
          >
            Đăng Nhập Tài Khoản Admin
          </Link>
          <Link
            href="/admin/recovery"
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs"
          >
            Khôi Phục Mật Khẩu Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-pop pb-12">
      {/* Tiêu đề Admin & Quick Recovery Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Hệ Thống Quản Trị Tối Cao (Admin)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Admin Dashboard
          </h1>
        </div>

        <Link
          href="/admin/recovery"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all self-start sm:self-auto"
        >
          <KeyRound className="w-4 h-4 text-purple-500" />
          <span>Khóa Khôi Phục Admin</span>
        </Link>
      </div>

      {/* 4 THẺ KPI DASHBOARD */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng Đề Thi</span>
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalQuizzes.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">Bộ đề đang lưu trữ</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng Câu Hỏi</span>
              <HelpCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalQuestions.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">Câu hỏi trắc nghiệm</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng Lượt Thi</span>
              <Play className="w-5 h-5 text-amber-500 fill-current" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalPlays.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">Lần người dùng làm bài</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Thành Viên</span>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">Tài khoản đã đăng ký</p>
          </div>
        </div>
      )}

      {/* DANH SÁCH QUẢN LÝ TẤT CẢ ĐỀ THI TRÊN HỆ THỐNG */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Quản Lý Toàn Bộ Bộ Đề Thi ({quizzes.length})</span>
            </h2>
            <p className="text-xs text-slate-400">Tìm kiếm, chỉnh sửa hoặc xóa vĩnh viễn đề thi rác/spam</p>
          </div>

          {/* Ô Tìm kiếm Realtime */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc mã đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {quizzes.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-1">
            <p>Không tìm thấy bộ đề nào khớp với từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Mã đề</th>
                  <th className="py-3 px-3">Tiêu đề đề thi</th>
                  <th className="py-3 px-3">Tác giả</th>
                  <th className="py-3 px-3 text-center">Số câu</th>
                  <th className="py-3 px-3 text-center">Lượt thi</th>
                  <th className="py-3 px-3">Ngày tạo</th>
                  <th className="py-3 px-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {quiz.shareCode}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {quiz.title}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {quiz.user ? (
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{quiz.user.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{quiz.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Khách vãng lai</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      {quiz.totalQuestions}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                      {quiz.playCount}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/quiz/${quiz.shareCode}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Xem bài thi"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/quiz/${quiz.shareCode}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="Chỉnh sửa đề thi (Quyền Admin)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === quiz.id}
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Xóa vĩnh viễn đề thi"
                        >
                          {deletingId === quiz.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
