// API Tạo Bộ đề tổng hợp mới (POST) và gán đề con
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// Hàm sinh mã chia sẻ ngẫu nhiên 6 ký tự
function generateShareCode(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Cơ sở dữ liệu đám mây chưa được cấu hình." },
        { status: 503 }
      );
    }

    const authUser = await getAuthUser();
    const body = await req.json();
    const { title, description, editPasscode, isPublic = true, quizShareCodes = [] } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên Bộ đề tổng hợp." },
        { status: 400 }
      );
    }

    // Sinh mã shareCode không trùng lặp
    let shareCode = generateShareCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await (prisma as any).quizCollection.findUnique({
        where: { shareCode },
      });
      if (!existing) {
        isUnique = true;
      } else {
        shareCode = generateShareCode();
        attempts++;
      }
    }

    // Tạo Bộ đề tổng hợp
    const collection = await (prisma as any).quizCollection.create({
      data: {
        shareCode,
        title: title.trim(),
        description: description ? description.trim() : null,
        editPasscode: editPasscode ? editPasscode.trim().toUpperCase() : null,
        isPublic: Boolean(isPublic),
        userId: authUser?.id || null,
      },
    });

    // Nếu có danh sách mã đề thi nhỏ đính kèm, kiểm tra quyền sở hữu trước khi liên kết
    if (Array.isArray(quizShareCodes) && quizShareCodes.length > 0) {
      const cleanCodes = quizShareCodes.map((c: string) => c.toUpperCase().trim());
      const isAdmin = authUser?.role === "ADMIN";

      let quizFilter: any = { shareCode: { in: cleanCodes } };
      if (!isAdmin) {
        if (authUser?.id) {
          quizFilter.OR = [
            { userId: authUser.id },
            { userId: null, editPasscode: null },
          ];
        } else {
          quizFilter.userId = null;
          quizFilter.editPasscode = null;
        }
      }

      await (prisma as any).quiz.updateMany({
        where: quizFilter,
        data: {
          collectionId: collection.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Tạo Bộ đề tổng hợp thành công!",
      collection: {
        id: collection.id,
        shareCode: collection.shareCode,
        title: collection.title,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi tạo Bộ đề tổng hợp:", error);
    return NextResponse.json(
      { error: "Không thể tạo Bộ đề: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
