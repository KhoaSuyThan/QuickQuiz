"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldAlert, Lock, Loader2, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function AdminRecoveryPage() {
  const router = useRouter();
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryKey || !newPassword) {
      setErrorMsg("Vui lòng điền đầy đủ Mã Khôi Phục Bí Mật và Mật Khẩu Mới!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Xác nhận mật khẩu mới không khớp!");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryKey, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Khôi phục thất bại");
      }

      setSuccessMsg(data.message || "Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Có lỗi xảy ra khi khôi phục.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-pop">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60 flex items-center justify-center shadow-lg">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Khôi Phục Mật Khẩu Admin
          </h1>
          <p className="text-xs text-slate-500">
            Dành riêng cho chủ sở hữu tài khoản Quản trị viên (khoanv249@gmail.com)
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg} Đang chuyển sang trang Đăng nhập...</span>
          </div>
        )}

        <form onSubmit={handleRecovery} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[11px] tracking-wider">
              Mã Khôi Phục Bí Mật (Master Secret Key)
            </label>
            <div className="relative">
              <ShieldAlert className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="Nhập chuỗi bí mật của Admin..."
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Khóa này được cấu hình an toàn trên biến môi trường máy chủ.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[11px] tracking-wider">
              Mật khẩu Admin mới (ít nhất 6 ký tự)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="Nhập mật khẩu mới..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[11px] tracking-wider">
              Xác nhận lại mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý khôi phục...</span>
              </>
            ) : (
              <span>Khôi Phục Mật Khẩu Admin</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại màn hình Đăng Nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
