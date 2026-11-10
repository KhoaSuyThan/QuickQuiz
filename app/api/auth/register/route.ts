import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, validatePasswordStrength } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Cơ sở dữ liệu chưa được kết nối" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { name, email, password } = body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập họ và tên" }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Địa chỉ email không hợp lệ" }, { status: 400 });
    }
    // Kiểm tra độ mạnh mật khẩu
    const pwdValidation = validatePasswordStrength(password);
    if (!pwdValidation.isValid) {
      return NextResponse.json({ error: pwdValidation.message }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Kiểm tra email đã đăng ký chưa
    const existing = await (prisma as any).user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email này đã được đăng ký tài khoản. Vui lòng đăng nhập!" },
        { status: 409 }
      );
    }

    // Băm mật khẩu và tạo user mới
    const passwordHash = await hashPassword(password);
    const newUser = await (prisma as any).user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: "USER",
      },
    });

    // Tạo JWT token và lưu vào Cookie
    const token = await createToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 ngày
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Lỗi khi đăng ký:", error);
    return NextResponse.json(
      { error: "Không thể tạo tài khoản: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
