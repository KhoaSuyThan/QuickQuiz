import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
