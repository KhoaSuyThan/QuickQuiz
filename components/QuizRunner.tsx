"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QuizQuestion, QuizData } from "@/lib/types";
import { prepareQuizQuestions } from "@/lib/shuffle";
import { Check, X, ArrowRight, Play, RotateCcw, HelpCircle, CheckCircle, XCircle, Edit3, Trash2, Loader2 } from "lucide-react";
import QuizResult from "./QuizResult";

interface QuizRunnerProps {
  quizData: QuizData;
  initialWrongQuestions?: QuizQuestion[]; // Dành cho chế độ làm lại các câu sai
}

export default function QuizRunner({ quizData, initialWrongQuestions }: QuizRunnerProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Bắt đầu làm bài với số lượng câu đã chọn
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
    setIsQuizStarted(true);
  };

  // Người dùng chọn 1 đáp án -> Kích hoạt Instant Feedback ngay
  const handleSelectOption = (optionId: string) => {
    if (isAnswerChecked) return; // Đã kiểm tra thì không cho chọn lại câu này

    setSelectedOptionId(optionId);
    setIsAnswerChecked(true);

    const currentQ = activeQuestions[currentIndex];
    const chosen = currentQ.options.find((o) => o.id === optionId);
    const isCorrect = chosen?.is_correct ?? false;

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    } else {
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

  // 1. Màn hình hoàn thành bài thi -> Hiển thị kết quả tổng kết
  if (isCompleted) {
    return (
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
    );
  }

  // 2. Màn hình cấu hình số lượng câu hỏi trước khi làm bài
  if (!isQuizStarted) {
    const isWrongOnlyMode = !!(initialWrongQuestions && initialWrongQuestions.length > 0);

    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-pop">
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
              <Link
                href={`/quiz/${quizData.shareCode || "DEMO101"}/edit`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                title="Chỉnh sửa câu hỏi và đáp án của đề này"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa đề</span>
              </Link>
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
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>Tổng số câu hỏi trong ngân hàng:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{basePool.length} câu</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
                Nhập số lượng câu hỏi bạn muốn làm:
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
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
                >
                  Làm tất cả ({basePool.length} câu)
                </button>
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
    );
  }

  // 3. Màn hình làm bài trực tiếp & Instant Feedback
  const currentQuestion = activeQuestions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / activeQuestions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-pop">
      {/* Thanh tiến độ & Thống kê realtime */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">
            Câu {currentIndex + 1} / {activeQuestions.length}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> {correctCount} đúng
            </span>
            <span className="flex items-center gap-1 text-rose-500 font-bold">
              <XCircle className="w-3.5 h-3.5" /> {wrongCount} sai
            </span>
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
    </div>
  );
}
