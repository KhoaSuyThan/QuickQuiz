"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Uploader from "@/components/Uploader";
import CreateCollectionForm from "@/components/CreateCollectionForm";
import { FileText, Layers, Sparkles } from "lucide-react";

export default function CreateContainer() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "collection" ? "collection" : "single";
  const [createType, setCreateType] = useState<"single" | "collection">(initialType);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Thanh chuyển đổi Loại Nội Dung Muốn Tạo */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-inner border border-slate-200/80 dark:border-slate-700/60 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setCreateType("single")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            createType === "single"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md shadow-slate-200/50 dark:shadow-none"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Đề Thi Đơn Lẻ</span>
        </button>

        <button
          type="button"
          onClick={() => setCreateType("collection")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            createType === "collection"
              ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md shadow-purple-200/50 dark:shadow-none"
              : "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="flex items-center gap-1.5">
            <span>Bộ Đề Tổng Hợp</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold uppercase">
              Mới
            </span>
          </span>
        </button>
      </div>

      {/* Hiển thị form tương ứng */}
      {createType === "single" ? (
        <Uploader />
      ) : (
        <CreateCollectionForm />
      )}
    </div>
  );
}
