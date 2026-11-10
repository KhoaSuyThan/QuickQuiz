import { NextResponse } from "next/server";
import { getAuthUser, verifyPassword, hashPassword, validatePasswordStrength } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để thực hiện" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 503 });
    }

    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới" },
        { status: 400 }
      );
    }

    // Kiểm tra độ mạnh mật khẩu mới
    const pwdValidation = validatePasswordStrength(newPassword);
    if (!pwdValidation.isValid) {
      return NextResponse.json({ error: pwdValidation.message }, { status: 400 });
    }

    // Lấy thông tin user hiện tại trong DB
    const user = await (prisma as any).user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Tài khoản không tồn tại" }, { status: 404 });
    }

    // Kiểm tra mật khẩu cũ
    const isCorrectOld = await verifyPassword(oldPassword, user.passwordHash);
    if (!isCorrectOld) {
      return NextResponse.json(
        { error: "Mật khẩu hiện tại không chính xác" },
        { status: 400 }
      );
    }

    // Cập nhật mật khẩu mới
    const newHash = await hashPassword(newPassword);
    await (prisma as any).user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({
      success: true,
      message: "Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.",
    });
  } catch (error: any) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    return NextResponse.json(
      { error: "Không thể đổi mật khẩu: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
