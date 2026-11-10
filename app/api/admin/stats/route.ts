// API Thống kê KPI Dashboard cho Admin
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bạn không có quyền truy cập trang quản trị này!" },
        { status: 403 }
      );
    }

    if (!prisma) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 503 });
    }

    // Thực hiện truy vấn thống kê đồng thời
    const [
      totalQuizzes,
      totalQuestions,
      totalUsers,
      playCountAgg,
      recentQuizzes,
      topQuizzes,
    ] = await Promise.all([
      prisma.quiz.count(),
      prisma.question.count(),
      (prisma as any).user.count(),
      prisma.quiz.aggregate({
        _sum: { playCount: true },
      }),
      prisma.quiz.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          shareCode: true,
          title: true,
          totalQuestions: true,
          playCount: true,
          createdAt: true,
          user: {
            select: { name: true, email: true },
          },
        } as any,
      }),
      prisma.quiz.findMany({
        take: 5,
        orderBy: { playCount: "desc" },
        select: {
          id: true,
          shareCode: true,
          title: true,
          totalQuestions: true,
          playCount: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalQuizzes,
        totalQuestions,
        totalUsers,
        totalPlays: playCountAgg._sum.playCount || 0,
        recentQuizzes,
        topQuizzes,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi tải thống kê admin:", error);
    return NextResponse.json(
      { error: "Không thể lấy dữ liệu thống kê: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
