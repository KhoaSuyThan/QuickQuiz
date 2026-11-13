"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Layers, 
  ArrowLeft, 
  Play, 
  Edit3, 
  Clock, 
  User, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Loader2, 
  PlusCircle, 
  Lock, 
  KeyRound,
  FileQuestion,
  TrendingUp,
  AlertCircle,
  Trash2,
  X,
  ShieldCheck
} from "lucide-react";

interface SubQuiz {
  id: string;
  shareCode: string;
  title: string;
  description: string | null;
  totalQuestions: number;
  playCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CollectionDetail {
  id: string;
  shareCode: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  isPublic: boolean;
  hasEditPasscode: boolean;
  isOwner: boolean;
  canDelete: boolean;
  totalQuestions: number;
  totalPlayCount: number;
  subQuizCount: number;
  authorName: string;
  createdAt: string;
  quizzes: SubQuiz[];
}

export default function CollectionDetailPage() {
  const routeParams = useParams();
  const code = (routeParams?.code as string)?.toUpperCase() || "";

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingSubQuizId, setDeletingSubQuizId] = useState<string | null>(null);

  // Quản lý mã PIN bảo mật
  const [passcode, setPasscode] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState("");
  const [isUnlockingPin, setIsUnlockingPin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCollection = async (customPin?: string) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const activePin = customPin !== undefined ? customPin : passcode || localStorage.getItem(`collection_pin_${code}`) || "";
      const headers: Record<string, string> = {};
      if (activePin) {
        headers["x-edit-passcode"] = activePin;
      }

      const res = await fetch(`/api/collections/${code}`, { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể tải thông tin bộ đề");
      }

      setCollection(data.collection);
      if (activePin && data.collection?.isOwner) {
        localStorage.setItem(`collection_pin_${code}`, activePin);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [code]);

  // Sao chép liên kết chia sẻ
  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Sao chép mã
  const handleCopyCode = async (c: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(c);
      }
      setCopiedCode(c);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Mở khóa bằng mã PIN bảo mật
  const handleUnlockPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = passcode.trim().toUpperCase();
    if (!cleanPin) {
      setPinError("Vui lòng nhập mã PIN quản trị");
      return;
    }

    setPinError("");
    setIsUnlockingPin(true);
    try {
      const res = await fetch(`/api/collections/${code}`, {
        headers: { "x-edit-passcode": cleanPin },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể kiểm tra mã PIN");
      }

      if (data.collection?.isOwner) {
        setCollection(data.collection);
        localStorage.setItem(`collection_pin_${code}`, cleanPin);
        setShowPinModal(false);
        setPasscode("");
      } else {
        setPinError("Mã PIN không chính xác! Vui lòng thử lại.");
      }
    } catch (err: any) {
      setPinError(err.message || "Lỗi kiểm tra mã PIN");
    } finally {
      setIsUnlockingPin(false);
    }
  };

  // Xóa đề thi nhỏ bên trong bộ đề
  const handleDeleteSubQuiz = async (subQuiz: SubQuiz) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đề thi nhỏ "${subQuiz.title}" này không? Hành động này không thể hoàn tác!`)) {
      return;
    }

    setDeletingSubQuizId(subQuiz.id);
    try {
      const activePin = passcode || localStorage.getItem(`collection_pin_${code}`) || "";
      const headers: Record<string, string> = {};
      if (activePin) {
        headers["x-edit-passcode"] = activePin;
      }

      // 1. Thử gọi API xóa đề theo shareCode hoặc id
      const res = await fetch(`/api/quizzes/${subQuiz.shareCode || subQuiz.id}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        // Fallback sang API my nếu là người dùng đang đăng nhập
        const fallbackRes = await fetch(`/api/quizzes/my?id=${subQuiz.id}`, {
          method: "DELETE",
        });

        if (!fallbackRes.ok) {
          const data = await fallbackRes.json().catch(() => ({}));
          alert(data.error || "Không thể xóa đề thi nhỏ này.");
          return;
        }
      }

      // 2. Cập nhật giao diện tức thì
      setCollection((prev) => {
        if (!prev) return prev;
        const newQuizzes = prev.quizzes.filter((q) => q.id !== subQuiz.id);
        return {
          ...prev,
          subQuizCount: newQuizzes.length,
          totalQuestions: Math.max(0, prev.totalQuestions - (subQuiz.totalQuestions || 0)),
          quizzes: newQuizzes,
        };
      });
    } catch (err) {
      console.error("Lỗi khi xóa đề thi nhỏ:", err);
      alert("Đã xảy ra lỗi máy chủ khi xóa đề thi.");
    } finally {
      setDeletingSubQuizId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-9 h-9 text-purple-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Đang tải bộ đề tổng hợp...</p>
      </div>
    );
  }

  if (errorMsg || !collection) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-3xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-500 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Không thể mở bộ đề</h2>
        <p className="text-sm text-slate-500">{errorMsg || "Bộ đề không tồn tại hoặc đã bị xóa."}</p>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Kho đề thi</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Nút quay lại */}
      <div className="flex items-center justify-between">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về Kho Đề Thi Cộng Đồng</span>
        </Link>

        {/* Nút Nhập mã PIN Quản trị nếu có */}
        {collection.hasEditPasscode && !collection.isOwner && (
          <button
            type="button"
            onClick={() => {
              setPinError("");
              setShowPinModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold border border-purple-200 dark:border-purple-800/80 shadow-sm hover:shadow transition-all group"
          >
            <KeyRound className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span>Mở khóa Quản lý bằng mã PIN</span>
          </button>
        )}

        {/* Badge xác nhận đã mở khóa quyền Quản Trị */}
        {collection.isOwner && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Đã mở khóa quyền Quản Trị</span>
          </span>
        )}
      </div>

      {/* Header Banner Bộ đề lớn - Tinh gọn, chiều cao thấp vừa vặn */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-purple-500/10 space-y-3">
        <div className="relative z-10 space-y-2.5">
          {/* Hàng 1: Badge + Mã đề + Nút chia sẻ */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold tracking-wide uppercase">
                <Layers className="w-3 h-3 text-purple-200" />
                <span>Bộ Đề Tổng Hợp</span>
              </span>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-md text-white text-[11px] font-mono font-bold">
                <span>Mã: {collection.shareCode}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(collection.shareCode)}
                  className="hover:text-purple-300 transition-colors"
                  title="Sao chép mã"
                >
                  {copiedCode === collection.shareCode ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-xs rounded-xl transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Đã sao chép!" : "Chia sẻ Bộ đề"}</span>
            </button>
          </div>

          {/* Tiêu đề & Mô tả */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="text-xs sm:text-sm text-purple-100/90 max-w-3xl leading-relaxed mt-1 line-clamp-2">
                {collection.description}
              </p>
            )}
          </div>

          {/* Thông số tổng quan nhỏ gọn */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-2 text-xs text-purple-100/80 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-300" />
              <span>Tác giả: <strong className="text-white">{collection.authorName}</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <FileQuestion className="w-3.5 h-3.5 text-purple-300" />
              <span>Tổng: <strong className="text-white">{collection.totalQuestions} câu hỏi</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-300" />
              <span>Gồm: <strong className="text-white">{collection.subQuizCount} đề thi nhỏ</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-300" />
              <span>Lượt làm: <strong className="text-white">{collection.totalPlayCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Họa tiết nền nhỏ gọn */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-6 top-6 opacity-10 hidden md:block">
          <Layers className="w-24 h-24 text-white" />
        </div>
      </div>

      {/* Danh Sách Các Đề Thi Nhỏ Bên Trong */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Danh Sách Đề Thi Nhỏ Bên Trong</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                {collection.subQuizCount} đề
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {collection.isOwner
                ? "Bạn có thể chọn từng đề nhỏ để làm bài luyện tập hoặc chỉnh sửa độc lập nội dung từng đề."
                : "Chọn một đề thi nhỏ bên dưới để bắt đầu làm bài luyện tập."}
            </p>
          </div>

          {/* Chỉ hiển thị nút Tạo Thêm Đề Mới cho chủ sở hữu hoặc quản trị viên */}
          {collection.isOwner && (
            <Link
              href={`/create?type=single&collectionId=${collection.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tạo Thêm Đề Mới</span>
            </Link>
          )}
        </div>

        {collection.quizzes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <Layers className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs text-slate-500">Bộ đề tổng hợp này hiện chưa có đề thi nhỏ nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collection.quizzes.map((subQuiz, idx) => (
              <div
                key={subQuiz.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                      Đề {idx + 1}: {subQuiz.shareCode}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(subQuiz.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {subQuiz.title}
                  </h3>

                  {subQuiz.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {subQuiz.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400 space-x-1">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {subQuiz.totalQuestions}
                    </span>{" "}
                    <span>câu hỏi</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {subQuiz.playCount}
                    </span>{" "}
                    <span>lượt thi</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Nút xóa đề nhỏ (khi có quyền quản trị hoặc là tác giả) */}
                    {collection.isOwner && (
                      <button
                        type="button"
                        disabled={deletingSubQuizId === subQuiz.id}
                        onClick={() => handleDeleteSubQuiz(subQuiz)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                        title="Xóa đề thi nhỏ này"
                      >
                        {deletingSubQuizId === subQuiz.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Nút sửa từng đề nhỏ bên trong - Chỉ tác giả hoặc quản trị viên mới thấy */}
                    {collection.isOwner && (
                      <Link
                        href={`/quiz/${subQuiz.shareCode}/edit`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all"
                        title="Chỉnh sửa câu hỏi của đề này"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Sửa Đề</span>
                      </Link>
                    )}

                    {/* Nút vào làm bài */}
                    <Link
                      href={`/quiz/${subQuiz.shareCode}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-sm shadow-purple-500/20 transition-all hover:scale-105"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Làm Bài</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Nhập PIN Quản Trị Cao Cấp gắn trực tiếp vào document.body */}
      {showPinModal && mounted && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/30 border border-purple-100 dark:border-purple-900/30 space-y-6 animate-pop">
            {/* Nút đóng X ở góc trên bên phải */}
            <button
              type="button"
              onClick={() => {
                setShowPinModal(false);
                setPinError("");
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Đóng hộp thoại"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Modal với Icon phát sáng & thông tin */}
            <div className="text-center space-y-3">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 blur-lg opacity-40 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <KeyRound className="w-7 h-7" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Mở Khóa Quyền Quản Trị
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Nhập mã PIN bí mật của tác giả để mở khóa quyền chỉnh sửa, thêm và quản lý đề thi nhỏ bên trong.
                </p>
              </div>

              {/* Tag định danh bộ đề */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] font-mono text-purple-700 dark:text-purple-300">
                <Layers className="w-3 h-3" />
                <span>Bộ đề: <strong className="font-bold">{collection.shareCode}</strong></span>
              </div>
            </div>

            {/* Form nhập PIN */}
            <form onSubmit={handleUnlockPin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                  Mã PIN bí mật
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="VD: DEMO123..."
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value.toUpperCase());
                      setPinError("");
                    }}
                    autoFocus
                    maxLength={20}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-center font-mono text-base font-bold tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-sans placeholder:font-normal focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition-all uppercase"
                  />
                </div>
              </div>

              {/* Báo lỗi trực quan */}
              {pinError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 animate-pop">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* Nhóm nút hành động */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinError("");
                  }}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUnlockingPin || !passcode.trim()}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-1.5"
                >
                  {isUnlockingPin ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang kiểm tra...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Mở Khóa Quản Trị</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
