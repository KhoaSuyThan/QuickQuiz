"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Zap, 
  PlusCircle, 
  History, 
  ArrowRight, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  KeyRound, 
  BookMarked,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Globe
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [quickCode, setQuickCode] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State Modal Đổi Mật Khẩu
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showModalOldPass, setShowModalOldPass] = useState(false);
  const [showModalNewPass, setShowModalNewPass] = useState(false);
  const [showModalConfirmPass, setShowModalConfirmPass] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ loading: boolean; error: string; success: string }>({
    loading: false,
    error: "",
    success: "",
  });

  // Tải thông tin người dùng từ Cookie phiên làm việc
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    }
    loadUser();
  }, [pathname]);

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) return;
    router.push(`/quiz/${quickCode.trim().toUpperCase()}`);
    setQuickCode("");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setPasswordStatus({ loading: false, error: "Vui lòng nhập đầy đủ thông tin", success: "" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ loading: false, error: "Mật khẩu mới xác nhận không khớp!", success: "" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ loading: false, error: "Mật khẩu mới phải có ít nhất 6 ký tự", success: "" });
      return;
    }

    setPasswordStatus({ loading: true, error: "", success: "" });

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể đổi mật khẩu");
      }

      setPasswordStatus({ loading: false, error: "", success: "Đổi mật khẩu thành công!" });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStatus({ loading: false, error: "", success: "" });
      }, 1500);
    } catch (err: any) {
      setPasswordStatus({ loading: false, error: err.message, success: "" });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Logo QuickQuiz */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                QuickQuiz
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Trắc nghiệm tức thì
              </span>
            </div>
          </Link>

          {/* Ô nhập nhanh mã đề */}
          <form onSubmit={handleJoinQuiz} className="hidden md:flex items-center relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Nhập mã đề (VD: DEMO101)..."
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value)}
              suppressHydrationWarning
              className="w-full text-xs font-mono uppercase bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              aria-label="Vào làm bài"
              suppressHydrationWarning
              className="absolute right-1.5 p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation Links & User Menu */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/community"
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-2 rounded-xl transition-colors ${
                pathname === "/community"
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                  : "text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>Kho Đề Thi</span>
            </Link>

            <Link
              href="/create"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-3.5 py-2 rounded-xl shadow-sm shadow-blue-600/30 transition-all hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">Tạo Đề</span>
            </Link>

            <Link
              href="/history"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Lịch Sử</span>
            </Link>

            {/* Nút Admin nếu người dùng là ADMIN */}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all"
                title="Bảng điều khiển Quản trị viên"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Admin</span>
              </Link>
            )}

            {/* Khu vực Tài Khoản Người Dùng */}
            {isLoadingUser ? (
              // Giữ khoảng trống trong suốt để tránh giật layout mà không hiện vòng tròn xám đen
              <div className="h-8 w-16 opacity-0 pointer-events-none" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold max-w-[100px] truncate text-slate-800 dark:text-slate-200">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs animate-pop">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        {user.role === "ADMIN" && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded text-[10px] font-bold">
                            Quản Trị Viên (Admin)
                          </span>
                        )}
                      </div>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold">Bảng Điều Khiển Admin</span>
                        </Link>
                      )}

                      <Link
                        href="/my-quizzes"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <BookMarked className="w-4 h-4 text-blue-500" />
                        <span>Bộ Đề Của Tôi</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsPasswordModalOpen(true);
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <KeyRound className="w-4 h-4 text-purple-500" />
                        <span>Đổi Mật Khẩu</span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng Xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Đăng Nhập
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-block text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 px-3 py-2 rounded-xl transition-colors"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Modal Đổi Mật Khẩu Trực Quan */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-pop">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-600" />
                <span>Đổi Mật Khẩu</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordStatus.error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordStatus.error}</span>
              </div>
            )}

            {passwordStatus.success && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordStatus.success}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showModalOldPass ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu cũ..."
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalOldPass(!showModalOldPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showModalOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu mới (≥ 8 ký tự, gồm chữ, số & ký tự đặc biệt)
                </label>
                <div className="relative">
                  <input
                    type={showModalNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalNewPass(!showModalNewPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showModalNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Xác nhận lại mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showModalConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalConfirmPass(!showModalConfirmPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showModalConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={passwordStatus.loading}
                  className="w-1/2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
                >
                  {passwordStatus.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Lưu Mật Khẩu</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
