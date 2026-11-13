"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QuizQuestion, QuizData } from "@/lib/types";
import { prepareQuizQuestions } from "@/lib/shuffle";
import { soundFx } from "@/lib/sound";
import { 
  Check, 
  X, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Trash2, 
  Loader2,
  Volume2,
  VolumeX,
  Timer,
  Clock,
  ChevronDown,
  KeyRound,
  ShieldCheck,
  Lock,
  AlertCircle,
  Layers
} from "lucide-react";
import QuizResult from "./QuizResult";

interface QuizRunnerProps {
  quizData: QuizData;
  initialWrongQuestions?: QuizQuestion[]; // Dành cho chế độ làm lại các câu sai
}

export default function QuizRunner({ quizData, initialWrongQuestions }: QuizRunnerProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());

  // Quản lý quyền chỉnh sửa & Mở khóa bằng mã PIN
  const [isOwner, setIsOwner] = useState<boolean>(Boolean(quizData.isOwner));
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const [isCheckingPin, setIsCheckingPin] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Tự động kiểm tra nếu đã lưu mã PIN hợp lệ cho đề lẻ HOẶC bộ đề tổng hợp cha
    const savedQuizPin = quizData.shareCode ? localStorage.getItem(`quiz_pin_${quizData.shareCode}`) : null;
    const savedCollectionPin = quizData.collectionShareCode
      ? localStorage.getItem(`collection_pin_${quizData.collectionShareCode}`)
      : null;
    const activePin = savedQuizPin || savedCollectionPin;

    if (activePin && !quizData.isOwner && quizData.shareCode) {
      fetch(`/api/quizzes/${quizData.shareCode}?forEdit=true`, {
        headers: { "x-edit-passcode": activePin },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.quiz?.isOwner) {
            setIsOwner(true);
          }
        })
        .catch(() => {});
    }
  }, [quizData.shareCode, quizData.isOwner, quizData.collectionShareCode]);

  // Xử lý mở khóa quyền chỉnh sửa bằng mã PIN
  const handleUnlockQuizPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim().toUpperCase();
    if (!cleanPin) {
      setPinError("Vui lòng nhập mã PIN chỉnh sửa");
      return;
    }

    setPinError("");
    setIsCheckingPin(true);
    try {
      const code = quizData.shareCode || quizData.id;
      const res = await fetch(`/api/quizzes/${code}?forEdit=true`, {
        headers: { "x-edit-passcode": cleanPin },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể kiểm tra mã PIN");
      }

      if (data.quiz?.isOwner) {
        setIsOwner(true);
        if (quizData.shareCode) {
          localStorage.setItem(`quiz_pin_${quizData.shareCode}`, cleanPin);
        }
        if (quizData.collectionShareCode) {
          localStorage.setItem(`collection_pin_${quizData.collectionShareCode}`, cleanPin);
        }
        setShowPinModal(false);
        setPinInput("");
      } else {
        setPinError("Mã PIN không chính xác! Vui lòng thử lại.");
      }
    } catch (err: any) {
      setPinError(err.message || "Lỗi kiểm tra mã PIN");
    } finally {
      setIsCheckingPin(false);
    }
  };

  // Bật/tắt âm thanh
  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  // Xử lý xóa đề thi (Tác giả hoặc Admin)
  const handleDeleteQuiz = async () => {
    if (!quizData.shareCode && !quizData.id) return;
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa vĩnh viễn bộ đề "${quizData.title}" không?\nThao tác này sẽ xóa toàn bộ câu hỏi và không thể hoàn tác.`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const codeToDelete = quizData.shareCode || quizData.id;
      const res = await fetch(`/api/quizzes/${codeToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể xóa bộ đề thi");
      }
      alert("Đã xóa bộ đề thi thành công!");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa bộ đề");
      setIsDeleting(false);
    }
  };

  // Ngân hàng câu hỏi gốc
  const basePool = initialWrongQuestions && initialWrongQuestions.length > 0
    ? initialWrongQuestions
    : quizData.questions;

  // Cấu hình số lượng câu hỏi cần làm
  const [questionCountInput, setQuestionCountInput] = useState<number>(basePool.length);

  // Cấu hình thời gian làm bài (Phút): 0 = Tự do (không đếm ngược)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(0);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>("");
  const [selectedDropdownTime, setSelectedDropdownTime] = useState<string>("");

  // Xử lý khi người dùng nhập số vào ô "nhập số" (chỉ nhận số nguyên > 0)
  const handleTimeNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, ""); // Chỉ cho phép nhập số
    if (!rawVal) {
      setCustomMinutesInput("");
      setTimeLimitMinutes(0);
      setSelectedDropdownTime("");
      return;
    }

    const num = parseInt(rawVal, 10);
    if (num > 0) {
      const finalNum = Math.min(num, 300); // Giới hạn tối đa 300 phút
      setCustomMinutesInput(String(finalNum));
      setTimeLimitMinutes(finalNum);
      const presets = ["5", "10", "15", "30", "45", "60", "90", "120"];
      setSelectedDropdownTime(presets.includes(String(finalNum)) ? String(finalNum) : "");
    }
  };

  // Xử lý khi người dùng chọn từ menu mũi tên xổ xuống
  const handleDropdownTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDropdownTime(val);

    if (!val) {
      setTimeLimitMinutes(0);
      setCustomMinutesInput("");
    } else {
      const num = parseInt(val, 10);
      setTimeLimitMinutes(num);
      setCustomMinutesInput(String(num));
    }
  };

  // Trạng thái đếm ngược (giây)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);

  const [isQuizStarted, setIsQuizStarted] = useState<boolean>(false);

  // Danh sách câu hỏi đang làm của phiên này (đã được xáo trộn câu & đáp án)
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Trạng thái câu hiện tại
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);

  // Thống kê kết quả phiên làm bài
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [wrongQuestionsList, setWrongQuestionsList] = useState<QuizQuestion[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Bộ đếm thời gian lùi (Countdown Timer) khi làm bài
  useEffect(() => {
    if (!isQuizStarted || isCompleted || timeLimitMinutes === 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          soundFx.playVictory();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isQuizStarted, isCompleted, timeLimitMinutes]);

  // Bắt đầu làm bài với số lượng câu và thời gian đã chọn
  const handleStartQuiz = (count?: number) => {
    const finalCount = count || questionCountInput;
    const prepared = prepareQuizQuestions(basePool, finalCount);
    setActiveQuestions(prepared);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerChecked(false);
    setCorrectCount(0);
    setWrongCount(0);
    setWrongQuestionsList([]);
    setIsCompleted(false);

    // Thiết lập thời gian làm bài
    if (timeLimitMinutes > 0) {
      setTimeLeftSeconds(timeLimitMinutes * 60);
    } else {
      setTimeLeftSeconds(0);
    }

    setIsQuizStarted(true);
  };

  // Người dùng chọn 1 đáp án -> Kích hoạt Instant Feedback & Âm thanh
  const handleSelectOption = (optionId: string) => {
    if (isAnswerChecked) return; // Đã kiểm tra thì không cho chọn lại câu này

    setSelectedOptionId(optionId);
    setIsAnswerChecked(true);

    const currentQ = activeQuestions[currentIndex];
    const chosen = currentQ.options.find((o) => o.id === optionId);
    const isCorrect = chosen?.is_correct ?? false;

    if (isCorrect) {
      soundFx.playCorrect();
      setCorrectCount((prev) => prev + 1);
    } else {
      soundFx.playWrong();
      setWrongCount((prev) => prev + 1);
      setWrongQuestionsList((prev) => [...prev, currentQ]);
    }
  };

  // Chuyển sang câu kế tiếp hoặc hoàn thành bài
  const handleNextQuestion = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerChecked(false);
    } else {
      soundFx.playVictory();
      setIsCompleted(true);
    }
  };

  // Làm lại toàn bộ đề (xáo trộn ngẫu nhiên mới)
  const handleRetryAll = () => {
    handleStartQuiz(questionCountInput);
  };

  // Chỉ làm lại các câu đã làm sai
  const handleRetryWrongOnly = () => {
    if (wrongQuestionsList.length === 0) return;
    const prepared = prepareQuizQuestions(wrongQuestionsList, wrongQuestionsList.length);
    setActiveQuestions(prepared);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerChecked(false);
    setCorrectCount(0);
    setWrongCount(0);
    setWrongQuestionsList([]);
    setIsCompleted(false);
    setIsQuizStarted(true);
  };

  // Định dạng thời gian MM:SS cho bộ đếm ngược
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Modal Mở Khóa Quyền Sửa Đề gắn vào document.body bằng createPortal để có thể hiển thị ở mọi màn hình
  const pinModalElement = showPinModal && mounted ? createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/30 border border-purple-100 dark:border-purple-900/30 space-y-6 animate-pop">
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

        <div className="text-center space-y-3">
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 blur-lg opacity-40 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
              <KeyRound className="w-7 h-7" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Mở Khóa Quyền Sửa Đề
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              {quizData.collectionShareCode
                ? `Nhập mã PIN của đề thi hoặc mã PIN của Bộ đề ${quizData.collectionShareCode} để mở khóa quyền chỉnh sửa.`
                : "Nhập mã PIN của tác giả để mở khóa quyền chỉnh sửa câu hỏi và đáp án của đề này."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {quizData.shareCode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] font-mono text-purple-700 dark:text-purple-300">
                Mã đề: <strong className="font-bold">{quizData.shareCode}</strong>
              </span>
            )}
            {quizData.collectionShareCode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-mono text-indigo-700 dark:text-indigo-300">
                Bộ đề: <strong className="font-bold">{quizData.collectionShareCode}</strong>
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleUnlockQuizPin} className="space-y-4">
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
                placeholder="Nhập mã PIN tác giả..."
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.toUpperCase());
                  setPinError("");
                }}
                autoFocus
                maxLength={20}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-center font-mono text-base font-bold tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-sans placeholder:font-normal focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition-all uppercase"
              />
            </div>
          </div>

          {pinError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 animate-pop">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

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
              disabled={isCheckingPin || !pinInput.trim()}
              className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-1.5"
            >
              {isCheckingPin ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang kiểm tra...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Mở Khóa Quyền Sửa</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  // 1. Màn hình hoàn thành bài thi -> Hiển thị kết quả tổng kết
  if (isCompleted) {
    return (
      <>
        <QuizResult
          quizTitle={quizData.title}
          shareCode={quizData.shareCode}
          totalAnswered={activeQuestions.length}
          correctCount={correctCount}
          wrongCount={wrongCount}
          wrongQuestions={wrongQuestionsList}
          allQuestions={basePool}
          onRetryAll={handleRetryAll}
          onRetryWrongOnly={handleRetryWrongOnly}
        />
        {pinModalElement}
      </>
    );
  }

  // 2. Màn hình cấu hình số lượng câu hỏi và thời gian trước khi làm bài
  if (!isQuizStarted) {
    const isWrongOnlyMode = !!(initialWrongQuestions && initialWrongQuestions.length > 0);

    return (
      <>
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-pop">
        {/* Nút bật tắt âm thanh ở góc trên */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            <span>{isMuted ? "Âm thanh: TẮT" : "Âm thanh: BẬT"}</span>
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <Play className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {quizData.title}
          </h1>
          {quizData.description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {quizData.description}
            </p>
          )}
          {quizData.shareCode && (
            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Mã đề: {quizData.shareCode}
              </span>
              {/* Nút Sửa đề: CHỈ HIỂN THỊ KHI ĐÃ LÀ OWNER (Tác giả, Admin hoặc đã mở khóa thành công) */}
              {isOwner && (
                <Link
                  href={`/quiz/${quizData.shareCode || "DEMO101"}/edit`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors shadow-sm"
                  title="Chỉnh sửa câu hỏi và đáp án của đề này"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa đề</span>
                </Link>
              )}

              {/* Nếu chưa là Owner: CẢ ĐỀ LẺ LẪN ĐỀ CON BÊN TRONG BỘ ĐỀ ĐỀU CÓ NÚT "Mở khóa sửa đề" */}
              {!isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setPinError("");
                    setShowPinModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-all border border-purple-200 dark:border-purple-800/80 shadow-sm"
                  title="Nhập mã PIN của tác giả hoặc mã PIN Bộ đề để mở khóa quyền chỉnh sửa đề này"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Mở khóa sửa đề</span>
                </button>
              )}

              {/* Nếu là đề con, hiển thị thêm nhãn liên kết Bộ đề cha */}
              {quizData.collectionShareCode && (
                <Link
                  href={`/collection/${quizData.collectionShareCode}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-all border border-indigo-200 dark:border-indigo-800/80"
                  title={`Đề thi nhỏ này thuộc Bộ Đề ${quizData.collectionShareCode}. Bấm để xem toàn bộ danh sách đề.`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Bộ đề: {quizData.collectionShareCode}</span>
                </Link>
              )}
              {quizData.canDelete && (
                <button
                  type="button"
                  onClick={handleDeleteQuiz}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg transition-colors"
                  title="Xóa bộ đề thi này (chỉ người tạo hoặc Admin)"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Xóa đề</span>
                </button>
              )}
            </div>
          )}
        </div>

        {isWrongOnlyMode ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>Chế độ ôn tập đặc biệt: Bạn đang làm lại {basePool.length} câu đã trả lời sai ở lần thi trước.</span>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-700/80 pb-2">
              <span>Tổng số câu hỏi trong ngân hàng:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{basePool.length} câu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Nhập số lượng câu hỏi */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
                  Nhập số lượng câu hỏi:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={basePool.length}
                    value={questionCountInput}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuestionCountInput(Math.min(Math.max(val, 1), basePool.length));
                    }}
                    className="w-24 text-center font-bold text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setQuestionCountInput(basePool.length)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-1 py-1"
                  >
                    Làm tất cả ({basePool.length})
                  </button>
                </div>
              </div>

              {/* 2. Thời gian làm bài (nằm bên cạnh, đơn vị Phút ở bên phải) */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
                  <Timer className="w-3.5 h-3.5 text-blue-600" /> Thời gian làm bài:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-stretch shadow-sm rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all bg-white dark:bg-slate-900">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="nhập số"
                      value={customMinutesInput}
                      onChange={handleTimeNumberChange}
                      className="w-24 px-2.5 py-2 text-center text-sm font-bold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                    />
                    <div className="relative border-l border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 flex items-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <select
                        value={selectedDropdownTime}
                        onChange={handleDropdownTimeChange}
                        className="appearance-none h-full pl-2 pr-6 text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="" className="hidden"></option>
                        <option value="5" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">5</option>
                        <option value="10" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">10</option>
                        <option value="15" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">15</option>
                        <option value="30" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">30</option>
                        <option value="45" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">45</option>
                        <option value="60" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">60</option>
                        <option value="90" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">90</option>
                        <option value="120" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">120</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-1.5 pointer-events-none" />
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                    Phút
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => handleStartQuiz(questionCountInput)}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
        >
          <span>Bắt Đầu Làm Bài Ngay</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
      {pinModalElement}
    </>
  );
}

  // 3. Màn hình làm bài trực tiếp & Instant Feedback
  const currentQuestion = activeQuestions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / activeQuestions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-pop">
      {/* Thanh tiến độ, Đồng hồ đếm ngược & Thống kê realtime */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">
            Câu {currentIndex + 1} / {activeQuestions.length}
          </span>

          {/* Đồng hồ đếm ngược (nếu có hẹn giờ) */}
          {timeLimitMinutes > 0 ? (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold border transition-all ${
              timeLeftSeconds <= 60
                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-300 animate-pulse"
                : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            }`}>
              <Timer className="w-3.5 h-3.5 shrink-0" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
              <Clock className="w-3 h-3" />
              <span>Tự do</span>
            </div>
          )}

          {/* Thống kê câu đúng/sai & Nút bật tắt âm thanh */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> {correctCount}
            </span>
            <span className="flex items-center gap-1 text-rose-500 font-bold">
              <XCircle className="w-3.5 h-3.5" /> {wrongCount}
            </span>
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>
          </div>
        </div>

        {/* Thanh progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Thẻ câu hỏi & các lựa chọn */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md">
            Câu hỏi số {currentIndex + 1}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug pt-1">
            {currentQuestion.questionText}
          </h2>
        </div>

        {/* Danh sách các lựa chọn đáp án */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((option, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            const isSelected = selectedOptionId === option.id;
            const isCorrectOption = option.is_correct;

            // Xác định màu sắc theo cơ chế Instant Feedback
            let optionStyles = "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200";

            if (isAnswerChecked) {
              if (isCorrectOption) {
                // Đáp án đúng luôn tô màu xanh lá
                optionStyles = "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500";
              } else if (isSelected && !isCorrectOption) {
                // Người dùng chọn sai: tô màu đỏ
                optionStyles = "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 font-semibold ring-1 ring-rose-500";
              } else {
                // Các lựa chọn khác bị làm mờ nhẹ
                optionStyles = "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60";
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={isAnswerChecked}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-sm ${optionStyles}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isAnswerChecked && isCorrectOption
                      ? "bg-emerald-600 text-white"
                      : isAnswerChecked && isSelected && !isCorrectOption
                      ? "bg-rose-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`}>
                    {letter}
                  </span>
                  <span>{option.text}</span>
                </div>

                {isAnswerChecked && isCorrectOption && (
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {isAnswerChecked && isSelected && !isCorrectOption && (
                  <X className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Lời giải thích (nếu có sau khi đã chọn) */}
        {isAnswerChecked && (
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs space-y-1 animate-pop">
            <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300">
              <HelpCircle className="w-4 h-4" />
              <span>Giải thích đáp án:</span>
            </div>
            <p className="text-blue-900 dark:text-blue-200 pl-5">
              {currentQuestion.explanation || "Đáp án chính xác đã được hệ thống ghi nhận."}
            </p>
          </div>
        )}

        {/* Nút sang câu tiếp theo */}
        {isAnswerChecked && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] text-sm"
            >
              <span>{currentIndex + 1 < activeQuestions.length ? "Câu Kế Tiếp" : "Xem Kết Quả"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {pinModalElement}
    </div>
  );
}
