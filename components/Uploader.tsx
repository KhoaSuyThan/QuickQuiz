"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  Bot,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowLeft
} from "lucide-react";
import { parseRawText, parseCSV, parseExcel } from "@/lib/parser";
import { QuizQuestion } from "@/lib/types";
import { saveLocalQuiz } from "@/lib/storage";

// Mẫu hiển thị sẵn đúng 1 câu duy nhất chuẩn cấu trúc
const DEFAULT_SAMPLE_TEXT = `Câu 1: Thủ đô của Việt Nam là gì?
*A. Hà Nội
B. Đà Nẵng
C. TP. Hồ Chí Minh
D. Cần Thơ
Giải thích: Hà Nội là thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.`;

// Mẫu câu lệnh Prompt chuẩn giúp AI (ChatGPT, Claude, Gemini, DeepSeek) sinh đề tương thích 100% QuickQuiz
const AI_PROMPT_TEMPLATE = `Hãy tạo giúp tôi [số lượng, VD: 10] câu hỏi trắc nghiệm về chủ đề "[Chủ đề hoặc dán tài liệu vào đây]" theo đúng định dạng chuẩn của phần mềm QuickQuiz dưới đây:

Quy tắc định dạng bắt buộc:
1. Mỗi câu hỏi bắt đầu bằng: "Câu X: [Nội dung câu hỏi]"
2. Mỗi câu có 4 đáp án A, B, C, D (hoặc từ 3-6 đáp án).
3. ĐÁP ÁN ĐÚNG PHẢI CÓ DẤU SAO (*) Ở ĐẦU DÒNG (Ví dụ: *A. Nội dung đáp án đúng). Các đáp án sai KHÔNG có dấu sao (Ví dụ: B. Đáp án sai).
4. Luôn có dòng "Giải thích: [Nội dung giải thích chi tiết]" ở cuối mỗi câu.
5. Mỗi câu hỏi cách nhau bởi đúng 1 dòng trống.

Ví dụ mẫu chuẩn:
Câu 1: Thủ đô của Việt Nam là gì?
*A. Hà Nội
B. Đà Nẵng
C. TP. Hồ Chí Minh
D. Cần Thơ
Giải thích: Hà Nội là thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.

Câu 2: Đâu không phải là ngôn ngữ lập trình hướng đối tượng thuần túy?
A. Java
B. C#
*C. C thuần túy
D. Python
Giải thích: Ngôn ngữ C là ngôn ngữ lập trình thủ tục, không hỗ trợ nguyên bản tính chất hướng đối tượng (OOP).`;


export default function Uploader() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");

  // Kiểm tra trạng thái đăng nhập
  const [authUser, setAuthUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.user) {
          setAuthUser(data.user);
        } else {
          setAuthUser(null);
        }
      } catch {
        setAuthUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Hiển thị sẵn dữ liệu mẫu 1 câu ngay khi vào trang, không cần người dùng phải bấm nút
  const [rawText, setRawText] = useState(DEFAULT_SAMPLE_TEXT);
  const [title, setTitle] = useState("Bộ Đề Trắc Nghiệm Mới");
  const [description, setDescription] = useState("Bộ câu hỏi ôn tập kiến thức.");
  const [parsedQuestions, setParsedQuestions] = useState<QuizQuestion[]>(() => parseRawText(DEFAULT_SAMPLE_TEXT));
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Trạng thái sao chép và xem trước Prompt mẫu cho AI
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  // Xử lý sao chép Prompt chuẩn hỗ trợ đa nền tảng trình duyệt
  const handleCopyPrompt = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(AI_PROMPT_TEMPLATE);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = AI_PROMPT_TEMPLATE;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error("Lỗi khi sao chép prompt cho AI:", err);
    }
  };

  // Xử lý phân tích Text trực tiếp khi người dùng chỉnh sửa
  const handleParseText = (text: string) => {
    setRawText(text);
    setErrorMsg("");
    if (!text.trim()) {
      setParsedQuestions([]);
      return;
    }
    const questions = parseRawText(text);
    setParsedQuestions(questions);
    if (questions.length === 0) {
      setErrorMsg("Chưa nhận diện được câu hỏi hợp lệ. Đảm bảo mỗi câu có 3-6 lựa chọn và có dấu * ở đầu đáp án đúng.");
    }
  };

  // Khôi phục lại mẫu 1 câu nếu cần
  const handleResetSample = () => {
    setTitle("Bộ Đề Trắc Nghiệm Mới");
    setDescription("Bộ câu hỏi ôn tập kiến thức.");
    handleParseText(DEFAULT_SAMPLE_TEXT);
  };

  // Xử lý upload file Excel / CSV
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setErrorMsg("");

    try {
      const fileName = file.name.toLowerCase();
      let questions: QuizQuestion[] = [];

      if (!title || title === "Bộ Đề Trắc Nghiệm Mới") {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }

      if (fileName.endsWith(".csv")) {
        const text = await file.text();
        questions = parseCSV(text);
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        questions = parseExcel(buffer);
      } else if (fileName.endsWith(".txt")) {
        const text = await file.text();
        questions = parseRawText(text);
      } else {
        throw new Error("Định dạng file không được hỗ trợ. Vui lòng chọn .xlsx, .csv hoặc .txt");
      }

      setParsedQuestions(questions);
      if (questions.length === 0) {
        setErrorMsg("Không tìm thấy câu hỏi hợp lệ trong file. Vui lòng kiểm tra lại cấu trúc cột.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Lỗi khi đọc file");
    } finally {
      setIsParsing(false);
    }
  };

  // Lưu đề thi lên PostgreSQL và IndexedDB
  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề cho bộ đề thi!");
      return;
    }
    if (parsedQuestions.length === 0) {
      setErrorMsg("Cần ít nhất 1 câu hỏi hợp lệ có đánh dấu * ở đáp án đúng!");
      return;
    }
    if (parsedQuestions.length > 200) {
      setErrorMsg(`Bộ đề hiện có ${parsedQuestions.length} câu hỏi. Hệ thống chỉ hỗ trợ tối đa 200 câu hỏi/đề để đảm bảo trải nghiệm thi mượt mà nhất.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Gửi lên API lưu vào PostgreSQL (nếu có kết nối DB)
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          questions: parsedQuestions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi lưu đề thi");
      }

      const finalShareCode = data.shareCode || "LOCAL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const finalId = data.quizId || "local-" + Date.now();
      const editPasscode = data.editPasscode;

      // 2. Lưu bộ đề vào IndexedDB trên máy người dùng để quản lý cục bộ
      await saveLocalQuiz({
        id: finalId,
        shareCode: finalShareCode,
        title: title.trim(),
        description: description.trim(),
        totalQuestions: parsedQuestions.length,
        editPasscode,
        createdAt: new Date().toISOString(),
        questions: parsedQuestions,
      });

      // 3. Chuyển hướng ngay đến màn hình làm bài
      router.push(`/quiz/${finalShareCode}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Có lỗi xảy ra khi tạo đề thi");
      setIsSubmitting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  // Bắt buộc đăng nhập trước khi tạo đề
  if (!authUser) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-xl animate-pop">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Yêu Cầu Đăng Nhập Để Tạo Đề Thi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Bạn cần đăng nhập tài khoản QuickQuiz để tạo, lưu trữ và quản lý các bộ đề trắc nghiệm của riêng mình.
          </p>
        </div>
        <div className="space-y-2.5 pt-2">
          <Link
            href="/login?callbackUrl=/create"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 text-sm"
          >
            <span>Đăng Nhập Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register?callbackUrl=/create"
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Chưa có tài khoản? Đăng ký tại đây</span>
          </Link>
          <Link
            href="/"
            className="w-full py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay về trang chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-pop">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Tạo Bộ Đề Trắc Nghiệm Mới
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Nhập dữ liệu trắc nghiệm linh hoạt (dán văn bản, file Excel hoặc CSV) với 3 đến 6 đáp án mỗi câu.
        </p>
      </div>

      {/* Thông tin bộ đề */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Tiêu đề bộ đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Ôn tập Trắc nghiệm Lịch sử - Chương 1..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Mô tả / Hướng dẫn (Tùy chọn)
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Đề gồm các câu hỏi từ mức độ nhận biết đến vận dụng cao..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Chọn Tab nhập dữ liệu */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("text")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "text"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Dán Văn Bản Thô (Text)</span>
            </button>
            <button
              onClick={() => setActiveTab("file")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "file"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Tải Lên File (Excel / CSV)</span>
            </button>
          </div>

          {activeTab === "text" && (
            <button
              type="button"
              onClick={handleResetSample}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Khôi phục mẫu 1 câu</span>
            </button>
          )}
        </div>

        {/* Nội dung Tab Text */}
        {activeTab === "text" && (
          <div className="space-y-3.5">
            {/* Khung gợi ý Prompt mẫu cho AI (ChatGPT, Claude, Gemini, DeepSeek) */}
            <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/80 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/30 border border-blue-200/80 dark:border-blue-800/60 rounded-xl p-3.5 shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        Prompt Mẫu Cho AI (ChatGPT, Claude, Gemini)
                      </span>
                      <span className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Chuẩn 100% cú pháp
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Sao chép prompt này gửi cho AI để sinh ngay danh sách câu hỏi nạp trực tiếp vào QuickQuiz.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowPromptDetails(!showPromptDetails)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <span>{showPromptDetails ? "Thu gọn" : "Xem prompt"}</span>
                    {showPromptDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-all duration-200 ${
                      copiedPrompt
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30 scale-102"
                        : "bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-blue-500/30"
                    }`}
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Khung nội dung chi tiết Prompt khi bấm xem */}
              {showPromptDetails && (
                <div className="mt-3 pt-3 border-t border-blue-200/60 dark:border-blue-900/50 space-y-2">
                  <div className="relative">
                    <pre className="text-[11px] font-mono bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed select-all">
                      {AI_PROMPT_TEMPLATE}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              💡 Quy tắc: Đặt dấu <span className="font-bold text-blue-600">*</span> ở đầu đáp án đúng (VD: <code>*A. Hà Nội</code>). Mỗi câu có 3-6 đáp án và các câu cách nhau bởi một dòng trống.
            </p>
            <textarea
              rows={8}
              placeholder="Dán câu hỏi của bạn vào đây..."
              value={rawText}
              onChange={(e) => handleParseText(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        )}

        {/* Nội dung Tab File */}
        {activeTab === "file" && (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-950/50">
            <input
              type="file"
              id="quiz-file-input"
              accept=".xlsx, .xls, .csv, .txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="quiz-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                {isParsing ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Nhấp để chọn file hoặc kéo thả file vào đây
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hỗ trợ định dạng: <b>.xlsx</b>, <b>.csv</b>, hoặc <b>.txt</b>
              </p>
              <div className="mt-2 text-[11px] text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-left">
                💡 Cấu trúc cột Excel/CSV: Cột 1: <code>Câu hỏi</code>, Cột 2: <code>Đáp án đúng</code>, Cột 3-7: <code>Các lựa chọn sai</code>
              </div>
            </label>
          </div>
        )}

        {/* Thông báo lỗi nếu có */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Xem trước câu hỏi đã phân tích */}
      {parsedQuestions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Đã nhận diện thành công: {parsedQuestions.length} câu hỏi
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
              Hợp lệ
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {parsedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 text-xs"
              >
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Câu {idx + 1}: {q.questionText}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-lg border flex items-center justify-between ${
                        opt.is_correct
                          ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>
                        {String.fromCharCode(65 + oIdx)}. {opt.text}
                      </span>
                      {opt.is_correct && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Đúng
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-[11px] text-slate-500 italic">
                    💡 Giải thích: {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Nút gửi tạo đề */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý & lưu đề...</span>
                </>
              ) : (
                <>
                  <span>Lưu Đề & Vào Làm Bài Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
