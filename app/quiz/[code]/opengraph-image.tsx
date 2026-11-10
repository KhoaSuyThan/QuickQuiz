import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cleanCode = code.toUpperCase().trim();

  let title = "Bộ Đề Trắc Nghiệm Thông Minh";
  let totalQuestions = 0;

  if (cleanCode === "DEMO101") {
    title = "Bộ Đề Mẫu: Kiến Thức Khoa Học & Xã Hội";
    totalQuestions = 5;
  } else if (prisma) {
    try {
      const quiz = await prisma.quiz.findFirst({
        where: {
          OR: [{ shareCode: cleanCode }, { id: code }],
        },
        select: { title: true, totalQuestions: true },
      });
      if (quiz) {
        title = quiz.title;
        totalQuestions = quiz.totalQuestions;
      }
    } catch {
      // Giữ giá trị mặc định nếu có lỗi kết nối DB
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: "linear-gradient(135deg, #090d16 0%, #171d3d 50%, #0f172a 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header với Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                boxShadow: "0 8px 16px rgba(37, 99, 235, 0.4)",
              }}
            >
              ⚡
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "-0.5px" }}>
                QuickQuiz
              </span>
              <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "600" }}>
                Luyện Trắc Nghiệm Instant Feedback
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "10px 22px",
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              borderRadius: "14px",
              color: "#60a5fa",
              fontSize: "18px",
              fontWeight: "800",
              fontFamily: "monospace",
              letterSpacing: "2px",
            }}
          >
            MÃ ĐỀ: {cleanCode}
          </div>
        </div>

        {/* Nội dung chính: Tiêu đề đề thi */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "auto 0" }}>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "800",
              color: "#38bdf8",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
            }}
          >
            Bài Thi Trắc Nghiệm Trực Tuyến
          </span>
          <h1
            style={{
              fontSize: title.length > 50 ? "46px" : "56px",
              fontWeight: "900",
              lineHeight: 1.2,
              letterSpacing: "-1px",
              color: "#f8fafc",
              margin: 0,
              maxWidth: "1000px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Footer: Thông tin câu hỏi & Call to Action */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {totalQuestions > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#cbd5e1",
                }}
              >
                <span>📝</span> {totalQuestions} Câu hỏi
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
                fontWeight: "700",
                color: "#10b981",
              }}
            >
              <span>✨</span> Chấm điểm tức thì
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
                fontWeight: "700",
                color: "#f59e0b",
              }}
            >
              <span>⏱️</span> Tự chọn thời gian
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
              padding: "12px 28px",
              borderRadius: "14px",
              fontSize: "18px",
              fontWeight: "800",
              color: "#ffffff",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
            }}
          >
            Vào Làm Bài Ngay ➜
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
