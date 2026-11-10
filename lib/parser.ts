// Bộ phân tích dữ liệu câu hỏi từ Text, CSV và Excel cho QuickQuiz
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { QuizQuestion, QuizOption } from "./types";

/**
 * Phân tích dữ liệu văn bản thô (Text Format) thành danh sách câu hỏi
 */
export function parseRawText(rawText: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  // Chuẩn hóa ký tự xuống dòng và tách các khối câu hỏi theo dòng trống
  const blocks = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 4) continue; // Phải có ít nhất 1 dòng câu hỏi + 3 dòng lựa chọn

    let questionText = "";
    const rawOptions: { text: string; isCorrect: boolean }[] = [];
    let explanation = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Kiểm tra dòng giải thích
      const explainMatch = line.match(/^(?:giải\s*thích|explanation|ghi\s*chú)[:\s]+(.*)$/i);
      if (explainMatch) {
        explanation = explainMatch[1].trim();
        continue;
      }

      // Dòng câu hỏi: là dòng đầu tiên không bắt đầu bằng dấu *
      if (!questionText && !line.startsWith("*")) {
        questionText = line.replace(/^(?:câu|question)\s*\d+[\.\:\-]\s*/i, "").trim();
        continue;
      }

      // CHỈ NHẬN DẤU * Ở ĐẦU MỖI DÒNG LỰA CHỌN ĐỂ ĐÁNH DẤU ĐÁP ÁN ĐÚNG
      const isMarkedCorrect = line.startsWith("*");
      let cleanLine = line;
      if (isMarkedCorrect) {
        cleanLine = cleanLine.substring(1).trim();
      }

      // Loại bỏ tiền tố lựa chọn (A., B., C., 1., 2...) nếu có
      const optText = cleanLine.replace(/^[A-Fa-f0-9][\.\)\:\-]\s*/, "").trim();
      if (optText) {
        rawOptions.push({
          text: optText,
          isCorrect: isMarkedCorrect,
        });
      }
    }

    // Kiểm tra tính hợp lệ: từ 3 đến 6 lựa chọn, có câu hỏi và có ít nhất 1 đáp án đúng
    const hasCorrect = rawOptions.some((o) => o.isCorrect);
    if (rawOptions.length >= 3 && rawOptions.length <= 6 && questionText && hasCorrect) {
      const options: QuizOption[] = rawOptions.map((o, idx) => ({
        id: String(idx + 1),
        text: o.text,
        is_correct: o.isCorrect,
      }));

      questions.push({
        questionText,
        options,
        explanation: explanation || undefined,
        orderIndex: questions.length + 1,
      });
    }
  }

  return questions;
}

/**
 * Phân tích dữ liệu từ file CSV
 */
export function parseCSV(csvContent: string): QuizQuestion[] {
  const parsed = Papa.parse<string[]>(csvContent, {
    skipEmptyLines: true,
  });

  const rows = parsed.data;
  if (!rows || rows.length < 2) return [];

  const questions: QuizQuestion[] = [];
  const startIndex = /question|câu hỏi/i.test(rows[0][0] || "") ? 1 : 0;

  for (let r = startIndex; r < rows.length; r++) {
    const row = rows[r];
    if (row.length < 4) continue;

    const questionText = (row[0] || "").trim();
    const correctAnswer = (row[1] || "").trim();
    if (!questionText || !correctAnswer) continue;

    const options: QuizOption[] = [
      { id: "1", text: correctAnswer, is_correct: true },
    ];

    for (let c = 2; c < Math.min(row.length, 8); c++) {
      const val = (row[c] || "").trim();
      if (val) {
        options.push({
          id: String(options.length + 1),
          text: val,
          is_correct: false,
        });
      }
    }

    if (options.length >= 3 && options.length <= 6) {
      questions.push({
        questionText,
        options,
        orderIndex: questions.length + 1,
      });
    }
  }

  return questions;
}

/**
 * Phân tích dữ liệu từ file Excel (Buffer/ArrayBuffer)
 */
export function parseExcel(data: ArrayBuffer): QuizQuestion[] {
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

  if (!rows || rows.length < 2) return [];

  const questions: QuizQuestion[] = [];
  const startIndex = /question|câu hỏi/i.test(String(rows[0][0] || "")) ? 1 : 0;

  for (let r = startIndex; r < rows.length; r++) {
    const row = rows[r];
    if (!Array.isArray(row) || row.length < 4) continue;

    const questionText = String(row[0] || "").trim();
    const correctAnswer = String(row[1] || "").trim();
    if (!questionText || !correctAnswer) continue;

    const options: QuizOption[] = [
      { id: "1", text: correctAnswer, is_correct: true },
    ];

    for (let c = 2; c < Math.min(row.length, 8); c++) {
      const val = String(row[c] || "").trim();
      if (val) {
        options.push({
          id: String(options.length + 1),
          text: val,
          is_correct: false,
        });
      }
    }

    if (options.length >= 3 && options.length <= 6) {
      questions.push({
        questionText,
        options,
        orderIndex: questions.length + 1,
      });
    }
  }

  return questions;
}

/**
 * Chuyển đổi danh sách câu hỏi thành văn bản chuẩn QuickQuiz (phục vụ chỉnh sửa văn bản nhanh)
 */
export function questionsToRawText(questions: QuizQuestion[]): string {
  const letters = ["A", "B", "C", "D", "E", "F"];
  return questions
    .map((q, qIdx) => {
      let block = `Câu ${qIdx + 1}: ${q.questionText}\n`;
      q.options.forEach((opt, optIdx) => {
        const prefix = letters[optIdx] || String(optIdx + 1);
        if (opt.is_correct) {
          block += `*${prefix}. ${opt.text}\n`;
        } else {
          block += `${prefix}. ${opt.text}\n`;
        }
      });
      if (q.explanation && q.explanation.trim()) {
        block += `Giải thích: ${q.explanation.trim()}\n`;
      }
      return block.trim();
    })
    .join("\n\n");
}

