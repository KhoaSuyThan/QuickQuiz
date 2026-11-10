// API Khôi phục mật khẩu Admin khẩn cấp bằng Master Key
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const MASTER_RECOVERY_KEY = process.env.ADMIN_SECRET_KEY || "24092005@KhoaRecovery";
const ADMIN_EMAIL = "khoanv249@gmail.com";

export async function POST(req: Request) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 503 });
    }

    const body = await req.json();
    const { recoveryKey, newPassword } = body;

    if (!recoveryKey || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập Mã Khôi Phục Bí Mật và Mật Khẩu Mới" },
        { status: 400 }
      );
    }

    // Kiểm tra Master Key
    if (recoveryKey.trim() !== MASTER_RECOVERY_KEY.trim()) {
      return NextResponse.json(
        { error: "Mã Khôi Phục Bí Mật không chính xác!" },
        { status: 403 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);

    // Cập nhật hoặc tạo mới tài khoản admin
    await (prisma as any).user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        passwordHash: newHash,
        role: "ADMIN",
      },
      create: {
        name: "Khoa Admin",
        email: ADMIN_EMAIL,
        passwordHash: newHash,
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Khôi phục thành công! Mật khẩu tài khoản ${ADMIN_EMAIL} đã được đặt lại.`,
    });
  } catch (error: any) {
    console.error("Lỗi khôi phục mật khẩu admin:", error);
    return NextResponse.json(
      { error: "Lỗi khôi phục: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
