"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Mail, Lock, Loader2, AlertTriangle, ArrowRight, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đăng nhập thất bại");
      }

      // Nếu có callbackUrl thì quay lại trang đó trước
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Có lỗi xảy ra khi đăng nhập.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-pop">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Đăng Nhập QuickQuiz
          </h1>
          <p className="text-xs text-slate-500">
            Quản lý và đồng bộ bộ đề thi của bạn trên mọi thiết bị
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[11px] tracking-wider">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="vidu@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-wider">
                Mật khẩu
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <span>Đăng Nhập Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}

// Bọc Suspense để Next.js hỗ trợ build prerender khi dùng useSearchParams
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-3 text-sm text-slate-500">Đang tải biểu mẫu đăng nhập...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
