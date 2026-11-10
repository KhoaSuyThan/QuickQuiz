// API Lấy thông tin phiên đăng nhập hiện tại
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ user: null });
    }

    // Đọc thêm thông tin mới nhất từ DB
    if (prisma) {
      const user = await (prisma as any).user.findUnique({
        where: { id: authUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (user) {
        return NextResponse.json({ user });
      }
    }

    return NextResponse.json({ user: authUser });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
