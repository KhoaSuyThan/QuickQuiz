// Script khởi tạo dữ liệu mẫu (Seeding) cho QuickQuiz
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Đang khởi tạo dữ liệu mẫu trắc nghiệm...");

  const demoQuiz = await prisma.quiz.upsert({
    where: { shareCode: "DEMO101" },
    update: {},
    create: {
      shareCode: "DEMO101",
      title: "Bộ Đề Mẫu Trắc Nghiệm Kiến Thức Chung",
      description: "Đề thi mẫu gồm 5 câu hỏi kiểm tra khả năng xáo trộn và chấm điểm tức thì.",
      totalQuestions: 5,
      questions: {
        create: [
          {
            questionText: "Thủ đô của Việt Nam là thành phố nào?",
            orderIndex: 1,
            explanation: "Hà Nội là thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.",
            options: [
              { id: "1", text: "Hà Nội", is_correct: true },
              { id: "2", text: "TP. Hồ Chí Minh", is_correct: false },
              { id: "3", text: "Đà Nẵng", is_correct: false },
              { id: "4", text: "Hải Phòng", is_correct: false },
            ],
          },
          {
            questionText: "Số nguyên tố chẵn duy nhất trong toán học là số nào?",
            orderIndex: 2,
            explanation: "Số 2 là số nguyên tố duy nhất chia hết cho 2.",
            options: [
              { id: "1", text: "0", is_correct: false },
              { id: "2", text: "2", is_correct: true },
              { id: "3", text: "4", is_correct: false },
              { id: "4", text: "6", is_correct: false },
            ],
          },
          {
            questionText: "Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?",
            orderIndex: 3,
            explanation: "Sao Thủy (Mercury) là hành tinh nằm gần Mặt Trời nhất.",
            options: [
              { id: "1", text: "Sao Hỏa", is_correct: false },
              { id: "2", text: "Sao Kim", is_correct: false },
              { id: "3", text: "Sao Thủy", is_correct: true },
              { id: "4", text: "Trái Đất", is_correct: false },
              { id: "5", text: "Sao Mộc", is_correct: false },
            ],
          },
          {
            questionText: "Đâu là ngôn ngữ lập trình chạy trực tiếp trên trình duyệt web?",
            orderIndex: 4,
            explanation: "JavaScript là ngôn ngữ lập trình tiêu chuẩn chạy trên các trình duyệt.",
            options: [
              { id: "1", text: "Python", is_correct: false },
              { id: "2", text: "C++", is_correct: false },
              { id: "3", text: "JavaScript", is_correct: true },
              { id: "4", text: "Java", is_correct: false },
            ],
          },
          {
            questionText: "Quốc gia nào có diện tích lớn nhất thế giới?",
            orderIndex: 5,
            explanation: "Liên bang Nga có diện tích khoảng 17,1 triệu km2, lớn nhất thế giới.",
            options: [
              { id: "1", text: "Canada", is_correct: false },
              { id: "2", text: "Nga", is_correct: true },
              { id: "3", text: "Mỹ", is_correct: false },
              { id: "4", text: "Trung Quốc", is_correct: false },
            ],
          },
        ],
      },
    },
  });

  console.log(`Đã khởi tạo thành công đề mẫu với mã: ${demoQuiz.shareCode}`);
}

main()
  .catch((e) => {
    console.error("Lỗi khi seed dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
