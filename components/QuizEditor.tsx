"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  ListChecks, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  KeyRound, 
  Plus, 
  Trash2, 
  Sparkles,
  HelpCircle,
  ExternalLink,
  Globe,
  Lock
} from "lucide-react";
import { QuizData, QuizQuestion } from "@/lib/types";
import { parseRawText, questionsToRawText, hasDuplicateAnswers } from "@/lib/parser";
import { getLocalQuizByCode, updateLocalQuiz } from "@/lib/storage";

interface QuizEditorProps {
  initialQuiz: QuizData;
  code: string;
}

export default function QuizEditor({ initialQuiz, code }: QuizEditorProps) {
  const router = useRouter();

  // Thông tin cơ bản của bộ đề
  const [title, setTitle] = useState(initialQuiz.title || "");
  const [description, setDescription] = useState(initialQuiz.description || "");
  const [isPublic, setIsPublic] = useState(initialQuiz.isPublic ?? true);

  // Mã PIN chỉnh sửa (ưu tiên đọc từ local IndexedDB)
  const [editPasscode, setEditPasscode] = useState("");
  const [isPasscodeRequired, setIsPasscodeRequired] = useState(false);

  // Tab chỉnh sửa: Text Format (nhanh) hoặc Visual List (trực quan)
  const [editorTab, setEditorTab] = useState<"text" | "visual">("text");

  // State văn bản thô chuẩn cú pháp QuickQuiz
  const [rawText, setRawText] = useState(() => questionsToRawText(initialQuiz.questions || []));

  // Danh sách câu hỏi đã parse
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuiz.questions || []);

  // Trạng thái lưu
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Kiểm tra mã PIN bảo vệ từ IndexedDB hoặc localStorage
  useEffect(() => {
    async function checkLocalPasscode() {
      // 1. Kiểm tra localStorage trước (đã mở khóa từ trang bộ đề cha hoặc đề con)
      if (typeof window !== "undefined") {
        const savedQuizPin = localStorage.getItem(`quiz_pin_${code}`);
        const savedColPin = initialQuiz.collectionShareCode
          ? localStorage.getItem(`collection_pin_${initialQuiz.collectionShareCode}`)
          : null;
        if (savedQuizPin) {
          setEditPasscode(savedQuizPin);
          return;
        }
        if (savedColPin) {
          setEditPasscode(savedColPin);
          return;
        }
      }

      // 2. Kiểm tra trong IndexedDB
      try {
        const local = await getLocalQuizByCode(code);
        if (local && local.editPasscode) {
          setEditPasscode(local.editPasscode);
        } else if (code === "DEMO101") {
          setEditPasscode("DEMO123");
        }
      } catch (e) {
        console.warn("Không thể đọc mã PIN từ IndexedDB:", e);
      }
    }
    checkLocalPasscode();
  }, [code, initialQuiz.collectionShareCode]);

  // Khi sửa văn bản ở Tab Text -> tự động parse lại danh sách câu hỏi
  const handleRawTextChange = (text: string) => {
    setRawText(text);
    setErrorMsg("");
    if (!text.trim()) {
      setQuestions([]);
      return;
    }
    const parsed = parseRawText(text);
    setQuestions(parsed);
  };

  // Đồng bộ lại Text khi chuyển từ tab Visual sang tab Text
  const handleSwitchToTextTab = () => {
    setRawText(questionsToRawText(questions));
    setEditorTab("text");
  };

  // Cập nhật đáp án đúng trong chế độ Visual
  const handleSetCorrectOption = (qIndex: number, optId: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const targetQ = { ...updated[qIndex] };
      targetQ.options = targetQ.options.map((opt) => ({
        ...opt,
        is_correct: opt.id === optId,
      }));
      updated[qIndex] = targetQ;
      return updated;
    });
  };

  // Cập nhật nội dung câu hỏi trong chế độ Visual
  const handleUpdateQuestionText = (qIndex: number, newText: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], questionText: newText };
      return updated;
    });
  };

  // Cập nhật nội dung đáp án trong chế độ Visual
  const handleUpdateOptionText = (qIndex: number, optIndex: number, newText: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const targetQ = { ...updated[qIndex] };
      const newOpts = [...targetQ.options];
      newOpts[optIndex] = { ...newOpts[optIndex], text: newText };
      targetQ.options = newOpts;
      updated[qIndex] = targetQ;
      return updated;
    });
  };

  // Xóa câu hỏi trong chế độ Visual
  const handleDeleteQuestion = (qIndex: number) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
  };

  // Thêm câu hỏi mới vào cuối danh sách trong chế độ Visual
  const handleAddNewQuestion = () => {
    const newQ: QuizQuestion = {
      questionText: `Câu hỏi mới số ${questions.length + 1}`,
      orderIndex: questions.length + 1,
      options: [
        { id: "1", text: "Đáp án A", is_correct: true },
        { id: "2", text: "Đáp án B", is_correct: false },
        { id: "3", text: "Đáp án C", is_correct: false },
        { id: "4", text: "Đáp án D", is_correct: false },
      ],
      explanation: "",
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  // Xử lý gửi cập nhật (Save Changes)
  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg("Tiêu đề bộ đề thi không được để trống!");
      return;
    }

    // Nếu đang ở tab text, đảm bảo parse dữ liệu mới nhất
    let currentQuestions = questions;
    if (editorTab === "text") {
      currentQuestions = parseRawText(rawText);
      setQuestions(currentQuestions);
    }

    if (currentQuestions.length === 0) {
      setErrorMsg("Cần ít nhất 1 câu hỏi hợp lệ có đánh dấu * ở đáp án đúng!");
      return;
    }

    // Kiểm tra không cho phép các đáp án trùng lặp nội dung trong từng câu hỏi
    for (let i = 0; i < currentQuestions.length; i++) {
      if (hasDuplicateAnswers(currentQuestions[i].options)) {
        setErrorMsg(`Câu hỏi số ${i + 1} ("${currentQuestions[i].questionText?.substring(0, 30)}...") có các đáp án bị trùng lặp nội dung. Vui lòng kiểm tra lại!`);
        return;
      }
    }

    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. Gọi API PUT lên server
      const res = await fetch(`/api/quizzes/${code}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-edit-passcode": editPasscode.trim(),
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          questions: currentQuestions,
          isPublic,
          editPasscode: editPasscode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setIsPasscodeRequired(true);
        }
        throw new Error(data.error || "Không thể cập nhật bộ đề");
      }

      // 2. Cập nhật lại trong IndexedDB của máy
      try {
        await updateLocalQuiz({
          id: initialQuiz.id || code,
          shareCode: initialQuiz.shareCode || code,
          title: title.trim(),
          description: description.trim(),
          totalQuestions: currentQuestions.length,
          isPublic,
          editPasscode: editPasscode.trim(),
          createdAt: initialQuiz.createdAt || new Date().toISOString(),
          questions: currentQuestions,
        });
      } catch (storageErr) {
        console.warn("Không thể cập nhật IndexedDB:", storageErr);
      }

      setSuccessMsg("Đã lưu các thay đổi thành công! Đang chuyển hướng...");

      // 3. Chuyển hướng về lại trang làm bài sau 1.2s
      setTimeout(() => {
        router.push(`/quiz/${initialQuiz.shareCode || code}`);
      }, 1200);

    } catch (err: any) {
      console.error("Lỗi khi lưu đề:", err);
      setErrorMsg(err?.message || "Có lỗi xảy ra khi lưu thay đổi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-pop pb-12">
      {/* Thanh điều hướng & Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href={`/quiz/${initialQuiz.shareCode || code}`}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Quay lại bài thi"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Chỉnh Sửa Bộ Đề Thi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mã chia sẻ: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{initialQuiz.shareCode || code}</span> • {questions.length} câu hỏi hợp lệ
            </p>
          </div>
        </div>

        {/* Nút Lưu Thay Đổi */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 text-xs sm:text-sm transition-all flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang Lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu Thay Đổi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Thông báo Thành công / Thất bại */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Lỗi: </span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Nhập mã PIN bảo mật nếu được yêu cầu */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>Mã PIN Bảo Vệ Chỉnh Sửa</span>
          </label>
          <span className="text-[11px] text-slate-500">
            {editPasscode ? "Đã nạp mã PIN từ thiết bị của bạn" : "Nhập mã PIN người tạo nếu có"}
          </span>
        </div>
        <input
          type="text"
          placeholder="Ví dụ: ED-XXXXXX hoặc DEMO123"
          value={editPasscode}
          onChange={(e) => setEditPasscode(e.target.value)}
          className={`w-full max-w-sm text-sm font-mono font-semibold bg-white dark:bg-slate-900 border rounded-xl px-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isPasscodeRequired ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-300 dark:border-slate-700"
          }`}
        />
        {isPasscodeRequired && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ Bộ đề này được bảo vệ bởi mã PIN. Vui lòng nhập đúng mã PIN do người tạo thiết lập để lưu thay đổi.
          </p>
        )}
      </div>

      {/* Thông tin Tiêu đề & Mô tả */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Tiêu đề bộ đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Mô tả / Hướng dẫn
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Lựa chọn Chế độ chia sẻ: Công khai (Public) hoặc Riêng tư (Private) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              {isPublic ? (
                <>
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <span>Công khai (Public Community)</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Riêng tư (Private Only)</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {isPublic
                ? "Bộ đề sẽ xuất hiện tại Kho Đề Thi chung để tất cả mọi người cùng học và thử sức."
                : "Chỉ những người có mã đề hoặc liên kết trực tiếp mới có thể truy cập."}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => setIsPublic(!isPublic)}
            className="shrink-0 flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
          >
            <div className="text-right">
              <span className={`text-xs font-bold block transition-colors ${
                isPublic ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              }`}>
                {isPublic ? "Đang bật: Công khai" : "Đang bật: Riêng tư"}
              </span>
              <span className="text-[10px] text-slate-400">
                {isPublic ? "Mọi người đều tìm thấy" : "Chỉ ai có mã mới xem"}
              </span>
            </div>

            {/* Thanh gạt Slider chuẩn */}
            <div
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                isPublic ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isPublic ? "translate-x-5 text-emerald-600" : "translate-x-0 text-slate-400"
                }`}
              >
                {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Thanh chuyển đổi Tab chỉnh sửa */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={handleSwitchToTextTab}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              editorTab === "text"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Sửa Bằng Văn Bản (Nhanh)</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorTab("visual")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              editorTab === "visual"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Sửa Danh Sách Trực Quan ({questions.length} câu)</span>
          </button>
        </div>

        <span className="text-xs font-medium text-slate-500">
          {questions.length} câu hỏi hợp lệ
        </span>
      </div>

      {/* NỘI DUNG TAB 1: SỬA VĂN BẢN NHANH */}
      {editorTab === "text" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Định dạng: Đặt dấu sao <code>*</code> ở đầu dòng đáp án đúng (VD: <code>*A. Hà Nội</code>).</span>
            <span>Mỗi câu cách nhau 1 dòng trống.</span>
          </div>

          <textarea
            rows={18}
            value={rawText}
            onChange={(e) => handleRawTextChange(e.target.value)}
            className="w-full font-mono text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-sm"
            placeholder="Dán hoặc chỉnh sửa nội dung trắc nghiệm tại đây..."
          />
        </div>
      )}

      {/* NỘI DUNG TAB 2: SỬA DANH SÁCH TRỰC QUAN */}
      {editorTab === "visual" && (
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-400 space-y-2">
              <p>Chưa có câu hỏi nào trong danh sách.</p>
              <button
                type="button"
                onClick={handleAddNewQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
              >
                + Thêm câu hỏi đầu tiên
              </button>
            </div>
          ) : (
            questions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Câu hỏi #{qIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(qIdx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Xóa câu hỏi này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Nội dung câu hỏi */}
                <input
                  type="text"
                  value={q.questionText}
                  onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                  className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập nội dung câu hỏi..."
                />

                {/* Danh sách các lựa chọn */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-medium text-slate-400">
                    Tích chọn nút tròn ở đáp án ĐÚNG:
                  </div>
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={opt.id || optIdx}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                        opt.is_correct
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correct-opt-${qIdx}`}
                        checked={opt.is_correct}
                        onChange={() => handleSetCorrectOption(qIdx, opt.id)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        title="Đánh dấu đáp án này là đúng"
                      />
                      <span className="text-xs font-bold font-mono text-slate-500 w-5">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleUpdateOptionText(qIdx, optIdx, e.target.value)}
                        className="flex-1 text-xs bg-transparent border-0 focus:outline-none text-slate-900 dark:text-slate-100 font-medium"
                        placeholder={`Nội dung lựa chọn ${String.fromCharCode(65 + optIdx)}...`}
                      />
                    </div>
                  ))}
                </div>

                {/* Dòng giải thích nếu có */}
                {q.explanation && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Giải thích: </span>
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            ))
          )}

          <button
            type="button"
            onClick={handleAddNewQuestion}
            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500 text-slate-600 dark:text-slate-400 hover:text-blue-600 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Câu Hỏi Mới</span>
          </button>
        </div>
      )}
    </div>
  );
}
