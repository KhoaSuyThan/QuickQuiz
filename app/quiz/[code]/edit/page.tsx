"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { QuizData } from "@/lib/types";
import { getLocalQuizByCode } from "@/lib/storage";
import QuizEditor from "@/components/QuizEditor";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function EditQuizPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const code = resolvedParams.code;

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuizForEdit() {
      setLoading(true);
      setError("");

      const cleanCode = code.toUpperCase().trim();

      // 1. Kiểm tra trong bộ nhớ IndexedDB cục bộ trước
      try {
        const foundLocal = await getLocalQuizByCode(cleanCode);
        if (foundLocal) {
          setQuizData(foundLocal);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Không thể đọc từ IndexedDB:", e);
      }

      // 2. Truy vấn từ API PostgreSQL với cờ forEdit=true để không tăng playCount
      try {
        const savedQuizPin = typeof window !== "undefined" ? localStorage.getItem(`quiz_pin_${cleanCode}`) : null;
        let headers: Record<string, string> = {};
        if (savedQuizPin) {
          headers["x-edit-passcode"] = savedQuizPin;
        }

        let res = await fetch(`/api/quizzes/${cleanCode}?forEdit=true`, { headers });
        let data = await res.json();

        // Nếu đề con thuộc bộ đề và chưa có quyền, thử dùng mã PIN bộ đề cha đã lưu trong máy
        if (res.ok && data.quiz && !data.quiz.isOwner && data.quiz.collectionShareCode) {
          const savedColPin = localStorage.getItem(`collection_pin_${data.quiz.collectionShareCode}`);
          if (savedColPin) {
            res = await fetch(`/api/quizzes/${cleanCode}?forEdit=true`, {
              headers: { "x-edit-passcode": savedColPin },
            });
            data = await res.json();
          }
        }

        if (res.ok && data.quiz) {
          if (!data.quiz.isOwner && !data.quiz.hasEditPasscode) {
            setError("Bạn không có quyền chỉnh sửa bộ đề này. Chỉ tác giả tạo đề hoặc Quản trị viên mới có quyền sửa.");
            setLoading(false);
            return;
          }
          setQuizData(data.quiz);
        } else {
          setError(data.error || "Không tìm thấy bộ đề trắc nghiệm này để chỉnh sửa.");
        }
      } catch (err: any) {
        setError("Không thể kết nối đến máy chủ lấy thông tin bộ đề.");
      } finally {
        setLoading(false);
      }
    }

    loadQuizForEdit();
  }, [code]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu bộ đề...</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-sm animate-pop">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Không Thể Mở Bộ Đề</h2>
          <p className="text-xs text-slate-500">{error || "Bộ đề trắc nghiệm không tồn tại hoặc đã bị xóa."}</p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay về trang chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <QuizEditor initialQuiz={quizData} code={code} />
    </div>
  );
}
