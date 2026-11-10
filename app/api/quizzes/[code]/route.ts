// API lấy thông tin và câu hỏi của bộ đề theo mã chia sẻ (Share Code) hoặc ID
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface QuestionItem {
  id: string;
  questionText: string;
  orderIndex: number;
  explanation: string | null;
  options: any;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cleanCode = code.toUpperCase().trim();

    if (!prisma) {
      return NextResponse.json(
        { error: "Cơ sở dữ liệu đám mây chưa được cấu hình. Vui lòng kiểm tra đề thi trong bộ nhớ cục bộ máy bạn." },
        { status: 503 }
      );
    }

    // Tìm kiếm theo shareCode hoặc theo id
    const quiz = await prisma.quiz.findFirst({
      where: {
        OR: [
          { shareCode: cleanCode },
          { id: code }
        ],
      },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Không tìm thấy bộ đề với mã hoặc ID được cung cấp" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const forEdit = searchParams.get("forEdit") === "true";

    // Chỉ tăng lượt làm bài khi người dùng vào làm bài, không tăng khi mở trang chỉnh sửa
    if (!forEdit) {
      await prisma.quiz.update({
        where: { id: quiz.id },
        data: { playCount: { increment: 1 } },
      });
    }

    // Kiểm tra quyền chỉnh sửa nếu client gửi kèm mã PIN
    const incomingPasscode = req.headers.get("x-edit-passcode")?.trim().toUpperCase();
    const isOwner = !!(
      incomingPasscode && 
      quiz.editPasscode && 
      incomingPasscode === quiz.editPasscode.toUpperCase()
    ) || !quiz.editPasscode; // Nếu đề chưa có mã bảo vệ thì coi như mở quyền

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        shareCode: quiz.shareCode,
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.totalQuestions,
        playCount: forEdit ? quiz.playCount : quiz.playCount + 1,
        hasEditPasscode: !!quiz.editPasscode,
        isOwner,
        createdAt: quiz.createdAt.toISOString(),
        questions: (quiz.questions as QuestionItem[]).map((q: QuestionItem) => ({
          id: q.id,
          questionText: q.questionText,
          orderIndex: q.orderIndex,
          explanation: q.explanation,
          options: q.options,
        })),
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy thông tin bộ đề:", error);
    return NextResponse.json(
      { error: "Không thể lấy thông tin bộ đề: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}

// API Cập nhật nội dung bộ đề thi (PUT)
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

    // Tìm kiếm đề thi hiện tại
    const existingQuiz = await prisma.quiz.findFirst({
      where: {
        OR: [
          { shareCode: cleanCode },
          { id: code }
        ],
      },
    });

    if (!existingQuiz) {
      return NextResponse.json(
        { error: "Không tìm thấy bộ đề để cập nhật" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, description, questions, editPasscode } = body as {
      title: string;
      description?: string;
      questions: any[];
      editPasscode?: string;
    };

    // Kiểm tra mã PIN bảo vệ quyền chỉnh sửa
    const authHeaderPasscode = req.headers.get("x-edit-passcode")?.trim().toUpperCase();
    const providedPasscode = (authHeaderPasscode || editPasscode?.trim() || "").toUpperCase();

    if (existingQuiz.editPasscode) {
      if (!providedPasscode || providedPasscode !== existingQuiz.editPasscode.toUpperCase()) {
        return NextResponse.json(
          { error: "Mã PIN chỉnh sửa không chính xác. Bạn không có quyền sửa bộ đề này!" },
          { status: 403 }
        );
      }
    }

    // Kiểm tra dữ liệu câu hỏi
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Dữ liệu cập nhật không hợp lệ: Cần có tiêu đề và ít nhất 1 câu hỏi" },
        { status: 400 }
      );
    }

    // Tiến hành cập nhật an toàn trong Prisma Transaction
    await prisma.$transaction(async (tx) => {
      // 1. Xóa các câu hỏi cũ của bộ đề
      await tx.question.deleteMany({
        where: { quizId: existingQuiz.id },
      });

      // 2. Cập nhật thông tin đề và tạo mới danh sách câu hỏi
      await tx.quiz.update({
        where: { id: existingQuiz.id },
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          totalQuestions: questions.length,
          updatedAt: new Date(),
          questions: {
            create: questions.map((q, idx) => ({
              questionText: q.questionText,
              orderIndex: idx + 1,
              explanation: q.explanation || null,
              options: q.options as any,
            })),
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      shareCode: existingQuiz.shareCode,
      message: "Cập nhật bộ đề thi thành công!",
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật bộ đề:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật bộ đề: " + (error?.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
