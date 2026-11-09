// Thuật toán xáo trộn ngẫu nhiên Fisher-Yates

/**
 * Xáo trộn ngẫu nhiên một mảng bất kỳ không làm thay đổi mảng gốc
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Lấy ngẫu nhiên N câu hỏi từ ngân hàng câu hỏi và xáo trộn lại thứ tự đáp án của từng câu
 */
export function prepareQuizQuestions(
  questions: import("./types").QuizQuestion[],
  count?: number
): import("./types").QuizQuestion[] {
  // 1. Xáo trộn toàn bộ ngân hàng câu hỏi
  const shuffledQuestions = shuffleArray(questions);

  // 2. Cắt lấy số lượng câu hỏi theo yêu cầu (nếu count hợp lệ)
  const selected = count && count > 0 && count <= shuffledQuestions.length
    ? shuffledQuestions.slice(0, count)
    : shuffledQuestions;

  // 3. Xáo trộn thứ tự các đáp án trong từng câu hỏi
  return selected.map((q, idx) => ({
    ...q,
    orderIndex: idx + 1,
    options: shuffleArray(q.options),
  }));
}
