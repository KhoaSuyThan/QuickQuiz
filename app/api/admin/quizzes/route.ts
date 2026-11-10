// API Quản lý danh sách toàn bộ đề thi cho Admin
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách đề thi (có tìm kiếm)
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    const whereClause: any = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { shareCode: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 100, // Tối đa 100 đề gần nhất
      select: {
        id: true,
        shareCode: true,
        title: true,
        description: true,
        totalQuestions: true,
        playCount: true,
        editPasscode: true,
        createdAt: true,
        user: {
          select: { name: true, email: true },
        },
      } as any,
    });

    return NextResponse.json({ success: true, quizzes });
  } catch (error: any) {
    console.error("Lỗi khi tải danh sách đề thi admin:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

// DELETE: Admin xóa đề thi rác/spam
export async function DELETE(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID đề thi cần xóa" }, { status: 400 });
    }

    // Xóa đề thi (câu hỏi sẽ được cascade xóa theo relation onDelete: Cascade)
    await prisma.quiz.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa vĩnh viễn đề thi thành công!",
    });
  } catch (error: any) {
    console.error("Lỗi khi xóa đề thi:", error);
    return NextResponse.json(
      { error: "Không thể xóa đề: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
