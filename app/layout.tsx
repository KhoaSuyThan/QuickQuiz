import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "QuickQuiz - Nền Tảng Trắc Nghiệm Tức Thì & Chia Sẻ Đề Thi",
  description: "Tải lên, làm trắc nghiệm với instant feedback, xáo trộn câu hỏi và đáp án, lưu trữ thông minh với PostgreSQL & IndexedDB.",
  // Cấu hình favicon vector SVG sắc nét và icon fallback cho đa nền tảng
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} QuickQuiz. Sẵn sàng triển khai 100% trên Vercel.</p>
        </footer>
      </body>
    </html>
  );
}
