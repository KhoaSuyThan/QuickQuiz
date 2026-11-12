import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QuizQuestion } from "@/lib/types";
import { getAuthUser } from "@/lib/auth";
import { hasDuplicateAnswers } from "@/lib/parser";

// Bộ nhớ đệm giới hạn tần suất tạo đề (In-Memory Rate Limiting)
const createQuizRateLimitMap = new Map<string, number[]>();

// Hàm làm sạch chuỗi chống XSS
function sanitizeText(str: string): string {
  if (!str) return "";
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/javascript:/gi, "");
}

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

    // 1. Kiểm tra giới hạn tần suất tạo đề (Tối đa 5 đề trong 10 phút)
    const clientKey = authUser.id || "guest";
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    const userTimestamps = (createQuizRateLimitMap.get(clientKey) || []).filter(t => t > tenMinutesAgo);

    if (userTimestamps.length >= 5 && authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bạn đã tạo đề quá nhanh (giới hạn 5 đề trong 10 phút). Vui lòng nghỉ ngơi một chút trước khi tạo tiếp!" },
        { status: 429 }
      );
    }
    userTimestamps.push(now);
    createQuizRateLimitMap.set(clientKey, userTimestamps);

    const body = await req.json();
    const { title, description, questions, editPasscode: customPasscode, isPublic = true } = body as {
      title: string;
      description?: string;
      questions: QuizQuestion[];
      editPasscode?: string;
      isPublic?: boolean;
    };

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Dữ liệu bộ đề không hợp lệ hoặc thiếu câu hỏi" },
        { status: 400 }
      );
    }

    // Kiểm tra không cho phép các đáp án trùng nhau trong từng câu hỏi
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (hasDuplicateAnswers(q.options)) {
        return NextResponse.json(
          { error: `Câu hỏi số ${i + 1} ("${q.questionText?.substring(0, 30)}...") có các đáp án bị trùng lặp nội dung. Vui lòng kiểm tra lại!` },
          { status: 400 }
        );
      }
    }

    // 2. Giới hạn dung lượng tối đa 200 câu hỏi/đề thi
    if (questions.length > 200) {
      return NextResponse.json(
        { error: `Bộ đề thi của bạn có ${questions.length} câu hỏi. Hệ thống chỉ hỗ trợ tối đa 200 câu hỏi/đề để đảm bảo hiệu năng máy chủ.` },
        { status: 400 }
      );
    }

    // Sinh mã chia sẻ duy nhất và mã PIN chỉnh sửa
    const shareCode = generateShareCode();
    const editPasscode = (customPasscode && customPasscode.trim()) || generateEditPasscode();

    // Làm sạch dữ liệu đầu vào chống XSS
    const cleanTitle = sanitizeText(title.trim());
    const cleanDescription = description ? sanitizeText(description.trim()) : null;

    // Nếu đã cấu hình PostgreSQL database thì lưu vào DB
    if (prisma) {
      const createdQuiz = await prisma.quiz.create({
        data: {
          title: cleanTitle,
          description: cleanDescription,
          shareCode,
          editPasscode,
          isPublic: isPublic !== false, // Lưu trạng thái công khai hoặc riêng tư
          userId: authUser?.id || null, // Gắn tài khoản người tạo nếu đã đăng nhập
          totalQuestions: questions.length,
          questions: {
            create: questions.map((q, idx) => ({
              questionText: sanitizeText(q.questionText),
              orderIndex: idx + 1,
              explanation: q.explanation ? sanitizeText(q.explanation) : null,
              options: q.options as any,
            })),
          },
        } as any,
      });

      return NextResponse.json({
        success: true,
        shareCode: createdQuiz.shareCode,
        quizId: createdQuiz.id,
        isPublic: (createdQuiz as any).isPublic ?? true,
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
      isPublic: isPublic !== false,
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
