"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Globe, 
  Search, 
  Play, 
  Clock, 
  User, 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  ArrowRight, 
  PlusCircle, 
  TrendingUp, 
  SlidersHorizontal,
  Layers,
  FolderOpen,
  Filter
} from "lucide-react";

interface CommunityQuiz {
  id: string;
  shareCode: string;
  title: string;
  description: string | null;
  totalQuestions: number;
  playCount: number;
  createdAt: string;
  authorName: string;
  itemType?: "collection" | "single";
  subQuizCount?: number;
  coverImage?: string | null;
}

export default function CommunityQuizzesPage() {
  const [quizzes, setQuizzes] = useState<CommunityQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"newest" | "popular">("newest");
  const [filterType, setFilterType] = useState<"all" | "single" | "collection">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Tải danh sách đề thi từ API cộng đồng
  const fetchCommunityQuizzes = async (query = "", sort = sortOption, type = filterType) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      params.set("sort", sort);
      params.set("type", type);

      const res = await fetch(`/api/quizzes/community?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.quizzes) {
        setQuizzes(data.quizzes);
      } else {
        setQuizzes([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải kho đề thi:", err);
      setQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityQuizzes(searchQuery, sortOption, filterType);
  }, [sortOption, filterType]);

  // Xử lý tìm kiếm đề thi
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCommunityQuizzes(searchQuery, sortOption, filterType);
  };

  // Sao chép mã đề thi
  const handleCopyCode = async (code: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-pop pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-blue-500/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold tracking-wide">
            <Globe className="w-3.5 h-3.5 text-emerald-300" />
            <span>Thư Viện Đề Thi Công Khai</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Kho Đề Thi Cộng Đồng
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Khám phá và luyện tập không giới hạn hàng loạt bộ đề trắc nghiệm chất lượng do cộng đồng giáo viên, học sinh và người dùng đóng góp.
          </p>

          <div className="pt-2">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-transform hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đóng Góp Đề Của Bạn</span>
            </Link>
          </div>
        </div>

        {/* Trang trí hiệu ứng nền */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-12 top-6 opacity-20 hidden md:block">
          <Sparkles className="w-32 h-32 text-white" />
        </div>
      </div>

      {/* Thanh Tìm Kiếm & Lọc */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
        {/* Ô Tìm kiếm */}
        <form onSubmit={handleSearchSubmit} suppressHydrationWarning className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên đề, mã đề hoặc mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            suppressHydrationWarning
            className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                fetchCommunityQuizzes("", sortOption, filterType);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-3"
            >
              Xóa
            </button>
          )}
        </form>

        {/* Bộ lọc phân loại & Sắp xếp */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Dropdown Chọn loại đề */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">Loại:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-white dark:bg-slate-900">Tất cả đề thi</option>
              <option value="collection" className="bg-white dark:bg-slate-900">📚 Bộ đề tổng hợp</option>
              <option value="single" className="bg-white dark:bg-slate-900">📝 Đề thi đơn lẻ</option>
            </select>
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sắp xếp:</span>
            </span>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSortOption("newest")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  sortOption === "newest"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Mới nhất
              </button>
              <button
                type="button"
                onClick={() => setSortOption("popular")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  sortOption === "popular"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Nhiều lượt thi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danh Sách Bộ Đề Công Khai */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Đang tải kho đề thi cộng đồng...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Globe className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {searchQuery ? "Không tìm thấy đề thi phù hợp" : "Kho đề thi đang chờ đề đầu tiên"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `Không có kết quả nào trùng với từ khóa "${searchQuery}". Hãy thử tìm kiếm với từ khóa khác.`
                : "Hãy là người đầu tiên tải lên bộ đề và chia sẻ công khai cho mọi người cùng sử dụng!"}
            </p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo Bộ Đề Mới Ngay</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => {
            const isCollection = quiz.itemType === "collection";

            return (
              <div
                key={quiz.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative ${
                  isCollection
                    ? "border-purple-200 dark:border-purple-900/60 hover:border-purple-400 dark:hover:border-purple-700 bg-gradient-to-b from-purple-50/20 to-transparent dark:from-purple-950/10"
                    : "border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900"
                }`}
              >
                <div className="space-y-2.5">
                  {/* Header card: Nhãn loại đề, Mã đề & Ngày tạo */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      {isCollection ? (
                        <span className="inline-flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                          <Layers className="w-3 h-3" />
                          <span>Bộ tổng hợp</span>
                        </span>
                      ) : (
                        <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                          {quiz.shareCode}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyCode(quiz.shareCode)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Sao chép mã"
                      >
                        {copiedCode === quiz.shareCode ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  {/* Tiêu đề & Mô tả */}
                  <div>
                    <h3 className={`text-sm font-bold line-clamp-2 transition-colors ${
                      isCollection
                        ? "text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400"
                        : "text-slate-900 dark:text-white group-hover:text-blue-600"
                    }`}>
                      {quiz.title}
                    </h3>
                    {quiz.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {quiz.description}
                      </p>
                    )}
                  </div>

                  {/* Người tạo đề */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="truncate">
                      Tạo bởi: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{quiz.authorName}</strong>
                    </span>
                  </div>
                </div>

                {/* Footer card: Thống kê & Nút hành động */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400 space-x-1">
                    {isCollection ? (
                      <>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {quiz.subQuizCount || 0}
                        </span>{" "}
                        <span>đề thi nhỏ</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {quiz.totalQuestions}
                        </span>{" "}
                        <span>câu</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {quiz.totalQuestions}
                        </span>{" "}
                        <span>câu hỏi</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {quiz.playCount}
                        </span>{" "}
                        <span>lượt</span>
                      </>
                    )}
                  </div>

                  {isCollection ? (
                    <Link
                      href={`/collection/${quiz.shareCode}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-sm shadow-purple-500/20 transition-all hover:scale-105"
                    >
                      <FolderOpen className="w-3 h-3" />
                      <span>Xem Bộ Đề</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/quiz/${quiz.shareCode}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm shadow-blue-500/20 transition-all hover:scale-105"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Vào Thi</span>
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
