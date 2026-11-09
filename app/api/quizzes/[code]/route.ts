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

    // Tăng lượt làm bài lên 1
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: { playCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        shareCode: quiz.shareCode,
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.totalQuestions,
        playCount: quiz.playCount + 1,
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
