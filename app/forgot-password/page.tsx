"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  KeyRound, 
  Mail, 
  Lock, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Send,
  RotateCcw
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Trạng thái các bước (1: Nhập Email gửi OTP, 2: Nhập OTP & Đặt mật khẩu mới)
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Trạng thái hiển thị mật khẩu
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Đếm ngược gửi lại OTP
  const [countdown, setCountdown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Quản lý đếm ngược thời gian gửi lại OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // BƯỚC 1: Gửi mã OTP đến email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND_OTP", email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể gửi mã OTP");
      }

      setResetToken(data.resetToken);
      setSuccessMsg(data.message || "Đã gửi mã OTP đến email của bạn!");
      setStep(2);
      setCountdown(60); // Đếm ngược 60s trước khi được gửi lại
    } catch (err: any) {
      setErrorMsg(err.message || "Có lỗi xảy ra khi gửi OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // BƯỚC 2: Xác minh OTP và Đặt lại mật khẩu mới
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setErrorMsg("Vui lòng nhập đầy đủ mã xác thực OTP 6 chữ số!");
      return;
    }
    if (!newPassword) {
      setErrorMsg("Vui lòng nhập mật khẩu mới!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Xác nhận mật khẩu mới không khớp!");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY_RESET",
          email,
          otp: otp.trim(),
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể đặt lại mật khẩu");
      }

      setSuccessMsg(data.message || "Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Có lỗi xảy ra khi đặt lại mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-pop">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center shadow-lg">
            {step === 1 ? <KeyRound className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6 text-emerald-500" />}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {step === 1 ? "Quên Mật Khẩu" : "Xác Thực Mã OTP"}
          </h1>
          <p className="text-xs text-slate-500">
            {step === 1
              ? "Nhập email tài khoản để nhận mã OTP xác thực qua hộp thư"
              : `Mã OTP đã được gửi tới ${email}. Vui lòng nhập mã để tạo mật khẩu mới`}
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
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 ? (
          /* FORM BƯỚC 1: GỬI OTP */
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[11px] tracking-wider">
                Địa chỉ Email tài khoản
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang gửi mã OTP đến Gmail...</span>
                </>
              ) : (
                <>
                  <span>Gửi Mã OTP Qua Email</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* FORM BƯỚC 2: NHẬP OTP & ĐẶT MẬT KHẨU MỚI */
          <form onSubmit={handleVerifyAndReset} className="space-y-4 text-xs sm:text-sm">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-wider">
                  Mã OTP 6 chữ số
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setErrorMsg("");
                  }}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Đổi email?
                </button>
              </div>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full font-mono text-center tracking-[8px] text-lg font-black bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-2 text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Mã có hiệu lực trong 5 phút</span>
                {countdown > 0 ? (
                  <span>Gửi lại sau {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Gửi lại mã OTP</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mật khẩu mới có nút con mắt Show/Hide */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[11px] tracking-wider">
                Mật khẩu mới (≥ 8 ký tự, có chữ, số & ký tự đặc biệt)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu mới có nút con mắt Show/Hide */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase text-[11px] tracking-wider">
                Xác nhận lại mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực & cập nhật...</span>
                </>
              ) : (
                <span>Xác Nhận & Đổi Mật Khẩu</span>
              )}
            </button>
          </form>
        )}

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
