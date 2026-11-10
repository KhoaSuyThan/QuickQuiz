import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QuizQuestion } from "@/lib/types";
import { getAuthUser } from "@/lib/auth";

// Hàm sinh mã chia sẻ ngẫu nhiên 6 ký tự (VD: QZ9F2K)
function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "QZ";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Hàm sinh mã PIN bảo mật chỉnh sửa ngẫu nhiên (VD: ED-7K2M9X)
function generateEditPasscode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "ED-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để tạo và xuất bản bộ đề thi." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, questions, editPasscode: customPasscode } = body as {
      title: string;
      description?: string;
      questions: QuizQuestion[];
      editPasscode?: string;
    };

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Dữ liệu bộ đề không hợp lệ hoặc thiếu câu hỏi" },
        { status: 400 }
      );
    }

    // Sinh mã chia sẻ duy nhất và mã PIN chỉnh sửa
    const shareCode = generateShareCode();
    const editPasscode = (customPasscode && customPasscode.trim()) || generateEditPasscode();

    // Nếu đã cấu hình PostgreSQL database thì lưu vào DB
    if (prisma) {
      const createdQuiz = await prisma.quiz.create({
        data: {
          title: title.trim(),
          description: description?.trim(),
          shareCode,
          editPasscode,
          userId: authUser?.id || null, // Gắn tài khoản người tạo nếu đã đăng nhập
          totalQuestions: questions.length,
          questions: {
            create: questions.map((q, idx) => ({
              questionText: q.questionText,
              orderIndex: idx + 1,
              explanation: q.explanation || null,
              options: q.options as any,
            })),
          },
        } as any,
      });

      return NextResponse.json({
        success: true,
        shareCode: createdQuiz.shareCode,
        quizId: createdQuiz.id,
        editPasscode: (createdQuiz as any).editPasscode || editPasscode,
        savedToDatabase: true,
        message: "Bộ đề đã được lưu thành công vào PostgreSQL",
      });
    }

    // Nếu chưa cấu hình PostgreSQL (môi trường Local thuần), trả về shareCode để client lưu IndexedDB
    return NextResponse.json({
      success: true,
      shareCode,
      quizId: "local-" + Date.now(),
      editPasscode,
      savedToDatabase: false,
      message: "Chưa cấu hình DATABASE_URL, bộ đề đã được lưu vào IndexedDB cục bộ của bạn.",
    });
  } catch (error: any) {
    console.error("Lỗi khi tạo bộ đề:", error);
    return NextResponse.json(
      { error: "Không thể tạo bộ đề: " + (error?.message || "Lỗi máy chủ nội bộ") },
      { status: 500 }
    );
  }
}
