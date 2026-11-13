// API Quản lý Chi tiết Bộ đề tổng hợp (Quiz Collection)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cleanCode = code.toUpperCase().trim();

    if (!prisma) {
      return NextResponse.json(
        { error: "Cơ sở dữ liệu đám mây chưa được cấu hình." },
        { status: 503 }
      );
    }

    // Tìm kiếm bộ đề tổng hợp theo shareCode hoặc id
    const collection = await (prisma as any).quizCollection.findFirst({
      where: {
        OR: [{ shareCode: cleanCode }, { id: code }],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        quizzes: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            shareCode: true,
            title: true,
            description: true,
            totalQuestions: true,
            playCount: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Không tìm thấy bộ đề tổng hợp với mã hoặc ID được cung cấp" },
        { status: 404 }
      );
    }

    // Kiểm tra quyền quản lý & chỉnh sửa
    const authUser = await getAuthUser();
    const incomingPasscode = req.headers.get("x-edit-passcode")?.trim().toUpperCase();
    const isAdmin = authUser?.role === "ADMIN";
    const isAuthor = !!(authUser?.id && collection.userId && authUser.id === collection.userId);
    const canDelete = isAdmin || isAuthor;

    const isOwner = !!(
      canDelete ||
      (incomingPasscode && collection.editPasscode && incomingPasscode === collection.editPasscode.toUpperCase()) ||
      (!collection.userId && !collection.editPasscode)
    );

    const totalQuestions = collection.quizzes.reduce((sum: number, q: any) => sum + (q.totalQuestions || 0), 0);
    const totalPlayCount = collection.quizzes.reduce((sum: number, q: any) => sum + (q.playCount || 0), 0);

    return NextResponse.json({
      success: true,
      collection: {
        id: collection.id,
        shareCode: collection.shareCode,
        title: collection.title,
        description: collection.description,
        coverImage: collection.coverImage,
        isPublic: collection.isPublic,
        hasEditPasscode: !!collection.editPasscode,
        isOwner,
        canDelete,
        totalQuestions,
        totalPlayCount,
        subQuizCount: collection.quizzes.length,
        authorName: collection.user?.name || "Người dùng ẩn danh",
        createdAt: collection.createdAt.toISOString(),
        quizzes: collection.quizzes,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi tải chi tiết bộ đề tổng hợp:", error);
    return NextResponse.json(
      { error: "Không thể lấy thông tin bộ đề: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}

// Cập nhật thông tin Bộ đề tổng hợp (PUT)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cleanCode = code.toUpperCase().trim();

    if (!prisma) {
      return NextResponse.json(
        { error: "Cơ sở dữ liệu đám mây chưa được cấu hình." },
        { status: 503 }
      );
    }

    const collection = await (prisma as any).quizCollection.findFirst({
      where: {
        OR: [{ shareCode: cleanCode }, { id: code }],
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Không tìm thấy bộ đề để cập nhật" },
        { status: 404 }
      );
    }

    const authUser = await getAuthUser();
    const incomingPasscode = req.headers.get("x-edit-passcode")?.trim().toUpperCase();
    const isAdmin = authUser?.role === "ADMIN";
    const isAuthor = !!(authUser?.id && collection.userId && authUser.id === collection.userId);

    const canEdit =
      isAdmin ||
      isAuthor ||
      (incomingPasscode && collection.editPasscode && incomingPasscode === collection.editPasscode.toUpperCase()) ||
      (!collection.userId && !collection.editPasscode);

    if (!canEdit) {
      return NextResponse.json(
        { error: "Bạn không có quyền chỉnh sửa bộ đề này. Vui lòng cung cấp mã PIN đúng." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, isPublic, editPasscode } = body;

    const updated = await (prisma as any).quizCollection.update({
      where: { id: collection.id },
      data: {
        title: title ? title.trim() : collection.title,
        description: description !== undefined ? description?.trim() : collection.description,
        isPublic: typeof isPublic === "boolean" ? isPublic : collection.isPublic,
        editPasscode: editPasscode !== undefined ? (editPasscode ? editPasscode.trim().toUpperCase() : null) : collection.editPasscode,
      },
    });

    const { editPasscode: _discard, ...safeCollection } = updated as any;

    return NextResponse.json({
      success: true,
      message: "Cập nhật bộ đề tổng hợp thành công",
      collection: safeCollection,
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật bộ đề tổng hợp:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật bộ đề: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}

// Xóa Bộ đề tổng hợp (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cleanCode = code.toUpperCase().trim();

    if (!prisma) {
      return NextResponse.json(
        { error: "Cơ sở dữ liệu đám mây chưa được cấu hình." },
        { status: 503 }
      );
    }

    const collection = await (prisma as any).quizCollection.findFirst({
      where: {
        OR: [{ shareCode: cleanCode }, { id: code }],
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Không tìm thấy bộ đề để xóa" },
        { status: 404 }
      );
    }

    const authUser = await getAuthUser();
    const isAdmin = authUser?.role === "ADMIN";
    const isAuthor = !!(authUser?.id && collection.userId && authUser.id === collection.userId);

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: "Chỉ tác giả hoặc Quản trị viên mới có quyền xóa bộ đề tổng hợp này." },
        { status: 403 }
      );
    }

    // Xóa bộ đề lớn (các đề con liên kết sẽ được đặt collectionId = null an toàn)
    await (prisma as any).quizCollection.delete({
      where: { id: collection.id },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa bộ đề tổng hợp thành công",
    });
  } catch (error: any) {
    console.error("Lỗi khi xóa bộ đề tổng hợp:", error);
    return NextResponse.json(
      { error: "Không thể xóa bộ đề: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
