import { Suspense } from "react";
import CreateContainer from "@/components/CreateContainer";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Tạo Đề Thi & Bộ Đề Mới - QuickQuiz",
  description: "Tải lên file hoặc dán nội dung trắc nghiệm để tạo đề thi đơn lẻ hoặc tạo bộ đề tổng hợp mới nhanh chóng.",
};

export default function CreateQuizPage() {
  return (
    <div className="py-2">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Đang chuẩn bị trình tạo đề...</p>
          </div>
        }
      >
        <CreateContainer />
      </Suspense>
    </div>
  );
}
