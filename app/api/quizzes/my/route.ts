// API Quản lý danh sách đề thi của người dùng hiện tại (My Quizzes)
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 503 });
    }

    // 1. Lấy các Bộ đề tổng hợp (Quiz Collections) của người dùng
    const collections = await (prisma as any).quizCollection.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        quizzes: {
          select: {
            id: true,
            totalQuestions: true,
            playCount: true,
          },
        },
      },
    });

    const formattedCollections = collections.map((c: any) => {
      const subQuizCount = c.quizzes.length;
      const totalQuestions = c.quizzes.reduce((sum: number, q: any) => sum + (q.totalQuestions || 0), 0);
      const playCount = c.quizzes.reduce((sum: number, q: any) => sum + (q.playCount || 0), 0);

      return {
        id: c.id,
        shareCode: c.shareCode,
        title: c.title,
        description: c.description,
        isCollection: true, // Đánh dấu là Bộ đề tổng hợp lớn
        subQuizCount,
        totalQuestions,
        playCount,
        editPasscode: c.editPasscode,
        isPublic: c.isPublic,
        createdAt: c.createdAt,
      };
    });

    // 2. Lấy các Đề thi đơn lẻ độc lập (chỉ lấy đề có collectionId == null, không hiển thị đề con của bộ lớn)
    const singleQuizzes = await prisma.quiz.findMany({
      where: { 
        userId: authUser.id,
        collectionId: null, // Loại trừ các đề nhỏ đã nằm bên trong bộ lớn
      } as any,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        shareCode: true,
        title: true,
        description: true,
        totalQuestions: true,
        playCount: true,
        editPasscode: true,
        isPublic: true,
        createdAt: true,
      } as any,
    });

    const formattedSingles = singleQuizzes.map((q) => ({
      id: q.id,
      shareCode: q.shareCode,
      title: q.title,
      description: q.description,
      isCollection: false, // Đề thi đơn lẻ độc lập
      subQuizCount: 0,
      totalQuestions: q.totalQuestions,
      playCount: q.playCount,
      editPasscode: q.editPasscode,
      isPublic: q.isPublic,
      createdAt: q.createdAt,
    }));

    // Kết hợp và sắp xếp theo ngày tạo mới nhất
    const combined = [...formattedCollections, ...formattedSingles].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, quizzes: combined });
  } catch (error: any) {
    console.error("Lỗi khi tải bộ đề của tôi:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

// DELETE: Người dùng xóa đề thi hoặc bộ đề do chính mình tạo
export async function DELETE(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const isCollection = searchParams.get("isCollection") === "true";

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID đề thi" }, { status: 400 });
    }

    // Nếu xóa Bộ đề tổng hợp (QuizCollection)
    if (isCollection) {
      const collection = await (prisma as any).quizCollection.findUnique({
        where: { id },
      });

      if (!collection) {
        return NextResponse.json({ error: "Bộ đề tổng hợp không tồn tại" }, { status: 404 });
      }

      if (collection.userId !== authUser.id && authUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Bạn không có quyền xóa bộ đề tổng hợp này!" },
          { status: 403 }
        );
      }

      await (prisma as any).quizCollection.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Đã xóa bộ đề tổng hợp thành công!",
      });
    }

    // Kiểm tra quyền sở hữu đề thi đơn lẻ
    const quiz: any = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Đề thi không tồn tại" }, { status: 404 });
    }

    if (quiz.userId !== authUser.id && authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa bộ đề này!" },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({
        where: { quizId: id },
      });
      await tx.quiz.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa đề thi thành công!",
    });
  } catch (error: any) {
    console.error("Lỗi khi xóa đề thi:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
