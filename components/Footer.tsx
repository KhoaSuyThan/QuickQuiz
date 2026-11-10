"use client";

import { useState } from "react";
import { Coffee, X, Copy, Check, ExternalLink, Maximize2, Minimize2 } from "lucide-react";

// Icon Facebook SVG chuẩn
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function Footer() {
  const [isOpenPopover, setIsOpenPopover] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const bankAccount = {
    bank: "Vietcombank",
    accountNumber: "1038907514",
    accountName: "NGUYEN VO LE KHOA",
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(bankAccount.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md py-6 text-xs text-slate-500 dark:text-slate-400 mt-12 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Thông tin bản quyền */}
          <div className="text-center sm:text-left space-y-0.5">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              © {new Date().getFullYear()} QuickQuiz. Nền tảng ôn luyện trắc nghiệm tức thì.
            </p>
            <p className="text-[11px] text-slate-400">
              Phát triển với trọn tâm huyết vì cộng đồng người học.
            </p>
          </div>

          {/* Các nút liên kết: Mời cà phê & Facebook cá nhân */}
          <div className="flex items-center gap-3">
            {/* Nút Mời Cà Phê có ảnh QR nhỏ ở góc */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => {
                setIsOpenPopover((prev) => !prev);
                setIsExpanded(false);
              }}
              className="group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 font-bold hover:shadow-md hover:scale-[1.02] transition-all"
              title="Mời tác giả 1 ly cà phê nếu bạn thấy ứng dụng hữu ích"
            >
              <Coffee className="w-4 h-4 text-amber-600 animate-bounce" />
              <span className="text-xs">Mời caffe</span>
              <div className="w-5 h-5 rounded-md overflow-hidden border border-amber-300 dark:border-amber-700 shrink-0 shadow-inner group-hover:scale-110 transition-transform bg-white">
                <img
                  src="/donate_qr_only.png"
                  alt="QR Cà phê nhỏ"
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {/* Link Facebook cá nhân */}
            <a
              href="https://www.facebook.com/lekhoa.nguyenvo.7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-sm transition-all"
              title="Trang Facebook cá nhân của Nguyễn Võ Lê Khoa"
            >
              <FacebookIcon className="w-4 h-4 fill-current" />
              <span className="text-xs">Lê Khoa</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </footer>

      {/* 1. HỘP THOẠI POP-UP NHỎ GỌN (Floating Card không che nội dung trang web) */}
      {isOpenPopover && !isExpanded && (
        <div className="fixed bottom-20 right-4 sm:right-8 z-40 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pop">
          {/* Header nhỏ */}
          <div className="p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800 dark:text-amber-400">
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
              <span>Mời tác giả 1 ly cà phê</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setIsExpanded(true)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors"
                title="Phóng to"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setIsOpenPopover(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors"
                title="Đóng"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Vùng QR vuông vắn gọn gàng */}
          <div className="p-3.5 flex flex-col items-center space-y-2.5">
            <div 
              onClick={() => setIsExpanded(true)}
              className="relative w-40 aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white cursor-pointer group p-1"
              title="Bấm để phóng to"
            >
              <img
                src="/donate_qr_only.png"
                alt="Mã QR Vietcombank vuông"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                  <Maximize2 className="w-3 h-3" /> Phóng to
                </span>
              </div>
            </div>

            {/* Thông tin chuyển khoản thu gọn */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2 text-[11px] border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Vietcombank:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400">
                  <span>1038907514</span>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleCopyAccountNumber}
                    className="p-0.5 rounded text-slate-400 hover:text-blue-600 transition-colors"
                    title="Sao chép STK"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 font-medium">Chủ TK:</span>
                <span className="font-semibold truncate">NGUYEN VO LE KHOA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHẾ ĐỘ PHÓNG TO GỌN GÀNG (Vừa vặn, không chiếm tràn màn hình) */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-[280px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pop">
            {/* Header Modal: Dùng flex justify-between để nút không bao giờ đè lên chữ */}
            <div className="p-3 pb-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20">
              <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 truncate pr-1">
                <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Cảm Ơn Bạn Đã Ủng Hộ!</span>
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors"
                  title="Thu nhỏ lại"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => {
                    setIsExpanded(false);
                    setIsOpenPopover(false);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors"
                  title="Đóng"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Hình ảnh mã QR chuẩn có chữ/logo Vietcombank và 2 logo VietQR/Napas247 bên dưới */}
            <div className="px-4 py-1.5 flex justify-center">
              <div className="relative w-full max-w-[210px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white">
                <img
                  src="/donate_qr_card.png"
                  alt="Mã QR Vietcombank chuẩn có logo"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Thông tin số tài khoản và nút Copy */}
            <div className="p-3.5 pt-1 space-y-2">
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700/80 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Vietcombank</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">NGUYEN VO LE KHOA</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-xs text-blue-600 dark:text-blue-400">
                      1038907514
                    </span>
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={handleCopyAccountNumber}
                      className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Sao chép số tài khoản"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setIsExpanded(false)}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Thu Nhỏ Hộp Thoại
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
