"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, PlusCircle, History, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [quickCode, setQuickCode] = useState("");
  const router = useRouter();

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) return;
    router.push(`/quiz/${quickCode.trim().toUpperCase()}`);
    setQuickCode("");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo QuickQuiz */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              QuickQuiz
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
              Trắc nghiệm tức thì
            </span>
          </div>
        </Link>

        {/* Ô nhập nhanh mã đề */}
        <form onSubmit={handleJoinQuiz} className="hidden sm:flex items-center relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Nhập mã đề (VD: DEMO101)..."
            value={quickCode}
            onChange={(e) => setQuickCode(e.target.value)}
            className="w-full text-xs font-mono uppercase bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            aria-label="Vào làm bài"
            className="absolute right-1.5 p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Các liên kết điều hướng */}
        <nav className="flex items-center gap-2">
          <Link
            href="/create"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg shadow-sm shadow-blue-600/30 transition-all hover:shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo Đề Mới</span>
          </Link>
          <Link
            href="/history"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Lịch Sử</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
