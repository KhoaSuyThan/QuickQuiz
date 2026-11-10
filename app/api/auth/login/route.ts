// API Đăng nhập tài khoản
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Cơ sở dữ liệu chưa được kết nối" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ email và mật khẩu" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Tìm kiếm user theo email
    const user = await (prisma as any).user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    // Kiểm tra mật khẩu
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    // Đảm bảo tài khoản admin tối cao luôn giữ role ADMIN
    let finalRole = user.role;
    if (cleanEmail === "khoanv249@gmail.com" && user.role !== "ADMIN") {
      await (prisma as any).user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      finalRole = "ADMIN";
    }

    // Tạo JWT token
    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: finalRole,
    });

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: finalRole,
      },
    });

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Lỗi khi đăng nhập:", error);
    return NextResponse.json(
      { error: "Không thể đăng nhập: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
