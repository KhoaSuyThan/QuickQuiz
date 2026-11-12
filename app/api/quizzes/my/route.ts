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

    const quizzes = await prisma.quiz.findMany({
      where: { userId: authUser.id } as any,
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

    return NextResponse.json({ success: true, quizzes });
  } catch (error: any) {
    console.error("Lỗi khi tải bộ đề của tôi:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

// DELETE: Người dùng xóa đề thi do chính mình tạo
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

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID đề thi" }, { status: 400 });
    }

    // Kiểm tra quyền sở hữu
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
