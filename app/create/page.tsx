import Uploader from "@/components/Uploader";

export const metadata = {
  title: "Tạo Đề Trắc Nghiệm Mới - QuickQuiz",
  description: "Tải lên file hoặc dán nội dung trắc nghiệm để tạo bộ đề mới nhanh chóng.",
};

export default function CreateQuizPage() {
  return (
    <div className="py-2">
      <Uploader />
    </div>
  );
}
