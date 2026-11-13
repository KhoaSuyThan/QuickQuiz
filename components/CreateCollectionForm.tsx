"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  Lock,
  Globe,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Plus,
  Check,
  ChevronRight
} from "lucide-react";

interface AvailableQuiz {
  id: string;
  shareCode: string;
  title: string;
  totalQuestions: number;
  collectionId: string | null;
}

export default function CreateCollectionForm() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [editPasscode, setEditPasscode] = useState("");
  const [manualCodes, setManualCodes] = useState("");

  // Danh sách đề thi sẵn có của người dùng
  const [availableQuizzes, setAvailableQuizzes] = useState<AvailableQuiz[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // Trạng thái gửi
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Tải danh sách đề thi của người dùng để chọn đưa vào bộ đề
  useEffect(() => {
    async function fetchMyQuizzes() {
      setLoadingQuizzes(true);
      try {
        const res = await fetch("/api/quizzes/my");
        const data = await res.json();
        if (res.ok && Array.isArray(data.quizzes)) {
          // Lọc các đề thi đơn lẻ chưa thuộc bộ đề nào hoặc tất cả đề của mình
          const singleQuizzes = data.quizzes.filter((q: any) => !q.collectionId);
          setAvailableQuizzes(singleQuizzes);
        }
      } catch (err) {
        console.warn("Không thể tải danh sách đề thi của bạn:", err);
      } finally {
        setLoadingQuizzes(false);
      }
    }
    fetchMyMyQuizzes: fetchMyQuizzes();
  }, []);

  // Xử lý bật/tắt chọn đề thi
  const handleToggleQuiz = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Submit tạo Bộ đề tổng hợp
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tên cho Bộ đề tổng hợp!");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    // Gom mã đề đã chọn + mã đề nhập thủ công
    const manualList = manualCodes
      .split(/[,;\s]+/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    const allQuizCodes = Array.from(new Set([...selectedCodes, ...manualList]));

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          isPublic,
          editPasscode: editPasscode.trim() ? editPasscode.trim().toUpperCase() : null,
          quizShareCodes: allQuizCodes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo bộ đề tổng hợp");
      }

      const shareCode = data.collection?.shareCode;
      if (shareCode) {
        router.push(`/collection/${shareCode}`);
      } else {
        router.push("/my-quizzes");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Đã có lỗi xảy ra khi tạo bộ đề");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-pop">
      {/* Banner Giới Thiệu Chế Độ Bộ Đề Tổng Hợp */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-500/10 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white">
            <Layers className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
              Chế Độ Đặc Biệt
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              Tạo Bộ Đề Tổng Hợp Mới
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed max-w-2xl">
          Tập hợp các đề trắc nghiệm nhỏ thành một bộ đề chuyên đề lớn. Học viên có thể xem tổng quan và làm từng đề nhỏ bên trong dễ dàng.
        </p>
      </div>

      {/* Thông tin cơ bản */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
            Tên Bộ Đề Tổng Hợp <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Bộ Đề Ôn Luyện Lập Trình Frontend & Backend..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
            Mô tả nội dung (Tùy chọn)
          </label>
          <textarea
            rows={3}
            placeholder="Mô tả tóm tắt về các chuyên đề nhỏ, đối tượng ôn tập hoặc hướng dẫn chung..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all leading-relaxed"
          />
        </div>

        {/* Thiết lập chế độ hiển thị & Mã PIN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Trạng thái công khai */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                {isPublic ? (
                  <>
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <span>Công khai (Public)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span>Riêng tư (Chỉ ai có mã)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isPublic ? "Hiển thị trên Kho Đề Cộng Đồng" : "Chỉ mở khi có đường link trực tiếp"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPublic ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isPublic ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Mã PIN chỉnh sửa */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <KeyRound className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Mã PIN Quản Trị (Tùy chọn)</span>
            </label>
            <input
              type="text"
              placeholder="VD: ADMIN123"
              value={editPasscode}
              onChange={(e) => setEditPasscode(e.target.value.toUpperCase())}
              className="w-full text-xs font-mono font-bold uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Chọn các đề thi con đưa vào Bộ đề */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Chọn Đề Thi Nhỏ Sẵn Có Của Bạn</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                Đã chọn: {selectedCodes.length} đề
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tích chọn những đề thi bạn đã tạo để gom chung vào Bộ đề tổng hợp này (hoặc có thể để trống và thêm sau).
            </p>
          </div>
        </div>

        {loadingQuizzes ? (
          <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span>Đang tải danh sách đề thi của bạn...</span>
          </div>
        ) : availableQuizzes.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
            <p className="text-xs text-slate-500">
              Bạn chưa có đề thi đơn lẻ nào chưa gán bộ đề.
            </p>
            <p className="text-[11px] text-slate-400">
              Bạn có thể tạo bộ đề tổng hợp trước, sau đó vào chi tiết bộ đề để bấm <strong>"Tạo Thêm Đề Mới"</strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
            {availableQuizzes.map((quiz) => {
              const isSelected = selectedCodes.includes(quiz.shareCode);
              return (
                <div
                  key={quiz.id}
                  onClick={() => handleToggleQuiz(quiz.shareCode)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 shadow-sm"
                      : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-purple-300"
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                        {quiz.shareCode}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {quiz.totalQuestions} câu hỏi
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {quiz.title}
                    </h4>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nhập mã thủ công */}
        <div className="pt-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Hoặc nhập thêm các mã đề thi khác (phân cách bằng dấu phẩy):
          </label>
          <input
            type="text"
            placeholder="VD: WEBFRONT, DATASYST, KTH101..."
            value={manualCodes}
            onChange={(e) => setManualCodes(e.target.value)}
            className="w-full text-xs font-mono font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
          />
        </div>
      </div>

      {/* Thông báo lỗi */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400 animate-pop">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Nút Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/"
          className="px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          Hủy bỏ
        </Link>

        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang tạo Bộ Đề...</span>
            </>
          ) : (
            <>
              <Layers className="w-4 h-4" />
              <span>Tạo Bộ Đề Tổng Hợp Ngay</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
