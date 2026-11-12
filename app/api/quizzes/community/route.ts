// API Lấy danh sách toàn bộ các bộ đề thi Công khai (Public Community Quizzes)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    if (!prisma) {
      return NextResponse.json({
        success: true,
        quizzes: [],
        message: "Chưa cấu hình cơ sở dữ liệu đám mây.",
      });
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const sort = searchParams.get("sort") || "newest"; // "newest" | "popular"

    // Điều kiện lọc: Chỉ lấy các đề thi công khai (isPublic = true)
    const whereCondition: any = {
      isPublic: true,
    };

    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shareCode: { contains: search.toUpperCase(), mode: "insensitive" } },
      ];
    }

    // Tiêu chí sắp xếp
    const orderBy =
      sort === "popular"
        ? [{ playCount: "desc" }, { createdAt: "desc" }]
        : [{ createdAt: "desc" }];

    const quizzes = await prisma.quiz.findMany({
      where: whereCondition,
      orderBy: orderBy as any,
      take: 60, // Giới hạn 60 đề thi công khai nổi bật nhất
      select: {
        id: true,
        shareCode: true,
        title: true,
        description: true,
        totalQuestions: true,
        playCount: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      } as any,
    });

    const formattedQuizzes = quizzes.map((q: any) => ({
      id: q.id,
      shareCode: q.shareCode,
      title: q.title,
      description: q.description,
      totalQuestions: q.totalQuestions,
      playCount: q.playCount,
      createdAt: q.createdAt,
      authorName: q.user?.name || "Người dùng ẩn danh",
      isAuthorSelf: false, // Sẽ so sánh ở client nếu cần
    }));

    return NextResponse.json({
      success: true,
      quizzes: formattedQuizzes,
      total: formattedQuizzes.length,
    });
  } catch (error: any) {
    console.error("Lỗi khi tải kho đề thi cộng đồng:", error);
    return NextResponse.json(
      { error: "Không thể tải kho đề thi: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
