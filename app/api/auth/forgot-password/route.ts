// API Đặt lại mật khẩu có gửi mã xác thực OTP qua Gmail SMTP
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePasswordStrength, createOtpToken, verifyOtpToken } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 503 });
    }

    const body = await req.json();
    const { action, email, otp, newPassword, resetToken } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Vui lòng nhập địa chỉ email hợp lệ!" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Hành động BƯỚC 1: Gửi mã OTP về email người dùng
    if (action === "SEND_OTP") {
      // Kiểm tra tài khoản có tồn tại trong hệ thống hay không
      const user = await (prisma as any).user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Không tìm thấy tài khoản nào với địa chỉ email này!" },
          { status: 404 }
        );
      }

      // Sinh mã OTP 6 chữ số ngẫu nhiên
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Băm mã OTP bằng bcrypt để bảo mật trong token
      const otpHash = await bcrypt.hash(otpCode, 8);

      // Tạo signed JWT Token có thời hạn chính xác 5 phút
      const token = await createOtpToken(cleanEmail, otpHash);

      // Gửi email thực tế qua Gmail SMTP
      const sent = await sendOtpEmail(cleanEmail, otpCode);

      if (!sent) {
        return NextResponse.json(
          { error: "Không thể gửi email OTP. Vui lòng kiểm tra lại dịch vụ Gmail SMTP." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Mã OTP đã được gửi thành công đến ${cleanEmail}. Vui lòng kiểm tra hộp thư (kể cả mục Spam)!`,
        resetToken: token,
      });
    }

    // 2. Hành động BƯỚC 2: Xác minh mã OTP và cập nhật mật khẩu mới
    if (action === "VERIFY_RESET") {
      if (!otp || otp.trim().length !== 6) {
        return NextResponse.json({ error: "Vui lòng nhập đầy đủ mã OTP 6 chữ số!" }, { status: 400 });
      }

      if (!resetToken) {
        return NextResponse.json({ error: "Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!" }, { status: 400 });
      }

      if (!newPassword) {
        return NextResponse.json({ error: "Vui lòng nhập mật khẩu mới!" }, { status: 400 });
      }

      // Kiểm tra độ mạnh mật khẩu mới
      const pwdValidation = validatePasswordStrength(newPassword);
      if (!pwdValidation.isValid) {
        return NextResponse.json({ error: pwdValidation.message }, { status: 400 });
      }

      // Giải mã và kiểm tra hạn 5 phút của resetToken
      const verified = await verifyOtpToken(resetToken);
      if (!verified || verified.email !== cleanEmail) {
        return NextResponse.json(
          { error: "Mã OTP đã hết hạn (quá 5 phút) hoặc không hợp lệ. Vui lòng nhấn gửi lại mã!" },
          { status: 400 }
        );
      }

      // So khớp mã OTP người dùng nhập với mã băm trong token
      const isMatch = await bcrypt.compare(otp.trim(), verified.otpHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Mã OTP không chính xác. Vui lòng kiểm tra lại!" }, { status: 400 });
      }

      // Tìm kiếm user và cập nhật mật khẩu mới
      const user = await (prisma as any).user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        return NextResponse.json({ error: "Không tìm thấy tài khoản để cập nhật!" }, { status: 404 });
      }

      const newHash = await hashPassword(newPassword);
      await (prisma as any).user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      return NextResponse.json({
        success: true,
        message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.",
      });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ!" }, { status: 400 });
  } catch (error: any) {
    console.error("Lỗi khi xử lý quên mật khẩu:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
