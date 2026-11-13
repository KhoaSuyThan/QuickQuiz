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
    const filterType = searchParams.get("type") || "all"; // "all" | "single" | "collection"

    let combinedItems: any[] = [];

    // 1. Lấy danh sách Bộ đề tổng hợp (Quiz Collections) nếu type là "all" hoặc "collection"
    if (filterType === "all" || filterType === "collection") {
      const collectionWhere: any = { isPublic: true };
      if (search) {
        collectionWhere.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { shareCode: { contains: search.toUpperCase(), mode: "insensitive" } },
        ];
      }

      const collections = await prisma.quizCollection.findMany({
        where: collectionWhere,
        take: 50,
        select: {
          id: true,
          shareCode: true,
          title: true,
          description: true,
          coverImage: true,
          createdAt: true,
          user: {
            select: { id: true, name: true },
          },
          quizzes: {
            where: { isPublic: true },
            select: {
              id: true,
              totalQuestions: true,
              playCount: true,
            },
          },
        },
      });

      const formattedCollections = collections.map((c) => {
        const subQuizCount = c.quizzes.length;
        const totalQuestions = c.quizzes.reduce((sum, q) => sum + (q.totalQuestions || 0), 0);
        const playCount = c.quizzes.reduce((sum, q) => sum + (q.playCount || 0), 0);

        return {
          id: c.id,
          shareCode: c.shareCode,
          title: c.title,
          description: c.description,
          coverImage: c.coverImage,
          itemType: "collection", // Phân loại: Bộ đề tổng hợp
          subQuizCount,
          totalQuestions,
          playCount,
          createdAt: c.createdAt,
          authorName: c.user?.name || "Người dùng ẩn danh",
        };
      });

      combinedItems = [...combinedItems, ...formattedCollections];
    }

    // 2. Lấy danh sách Đề thi đơn lẻ (Quiz không thuộc bộ đề lớn nào) nếu type là "all" hoặc "single"
    if (filterType === "all" || filterType === "single") {
      const quizWhere: any = {
        isPublic: true,
        collectionId: null, // Đề đơn lẻ độc lập bên ngoài
      };

      if (search) {
        quizWhere.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { shareCode: { contains: search.toUpperCase(), mode: "insensitive" } },
        ];
      }

      const singleQuizzes = await prisma.quiz.findMany({
        where: quizWhere,
        take: 50,
        select: {
          id: true,
          shareCode: true,
          title: true,
          description: true,
          totalQuestions: true,
          playCount: true,
          createdAt: true,
          user: {
            select: { id: true, name: true },
          },
        },
      });

      const formattedSingles = singleQuizzes.map((q) => ({
        id: q.id,
        shareCode: q.shareCode,
        title: q.title,
        description: q.description,
        itemType: "single", // Phân loại: Đề đơn lẻ
        subQuizCount: 0,
        totalQuestions: q.totalQuestions,
        playCount: q.playCount,
        createdAt: q.createdAt,
        authorName: q.user?.name || "Người dùng ẩn danh",
      }));

      combinedItems = [...combinedItems, ...formattedSingles];
    }

    // 3. Sắp xếp danh sách tổng hợp
    combinedItems.sort((a, b) => {
      if (sort === "popular") {
        return (b.playCount || 0) - (a.playCount || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      quizzes: combinedItems,
      total: combinedItems.length,
    });
  } catch (error: any) {
    console.error("Lỗi khi tải kho đề thi cộng đồng:", error);
    return NextResponse.json(
      { error: "Không thể tải kho đề thi: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
