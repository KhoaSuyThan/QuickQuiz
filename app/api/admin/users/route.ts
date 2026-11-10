// API Quản lý danh sách người dùng dành cho Quản trị viên (Admin)
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SUPER_ADMIN_EMAIL = "khoanv249@gmail.com";

// GET: Lấy danh sách toàn bộ người dùng (có tìm kiếm)
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập!" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    const whereClause: any = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const users = await (prisma as any).user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { quizzes: true },
        },
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách người dùng: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật quyền hạn (Role: USER <-> ADMIN)
export async function PUT(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập!" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 503 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ!" }, { status: 400 });
    }

    const targetUser = await (prisma as any).user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Không tìm thấy người dùng!" }, { status: 404 });
    }

    // Bảo vệ tài khoản Admin tối cao không bị hạ quyền
    if (targetUser.email === SUPER_ADMIN_EMAIL && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không thể thay đổi quyền của tài khoản Quản Trị Viên Tối Cao!" },
        { status: 400 }
      );
    }

    // Cập nhật vai trò mới
    const updated = await (prisma as any).user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật quyền của ${updated.name} thành ${updated.role}`,
      user: updated,
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật quyền người dùng:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật quyền: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}

// DELETE: Xóa tài khoản người dùng
export async function DELETE(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập!" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Cơ sở dữ liệu chưa sẵn sàng" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "Thiếu ID người dùng cần xóa!" }, { status: 400 });
    }

    // Không cho phép tự xóa tài khoản của chính mình
    if (userId === authUser.id) {
      return NextResponse.json(
        { error: "Bạn không thể tự xóa tài khoản đang đăng nhập của chính mình!" },
        { status: 400 }
      );
    }

    const targetUser = await (prisma as any).user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Người dùng không tồn tại!" }, { status: 404 });
    }

    // Bảo vệ tài khoản Admin tối cao
    if (targetUser.email === SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Tuyệt đối không thể xóa tài khoản Quản Trị Viên Tối Cao!" },
        { status: 400 }
      );
    }

    // Xóa người dùng (các đề thi của user sẽ có userId = null nhờ onDelete: SetNull trong schema)
    await (prisma as any).user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa tài khoản ${targetUser.email} thành công!`,
    });
  } catch (error: any) {
    console.error("Lỗi khi xóa người dùng:", error);
    return NextResponse.json(
      { error: "Không thể xóa người dùng: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
