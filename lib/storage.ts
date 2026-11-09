// Quản lý cơ sở dữ liệu cục bộ IndexedDB trên trình duyệt với idb
import { openDB, DBSchema, IDBPDatabase } from "idb";
import { QuizAttemptRecord, LocalSavedQuiz } from "./types";

interface FastQuizDBSchema extends DBSchema {
  attempts: {
    key: string;
    value: QuizAttemptRecord;
    indexes: { "by-date": string };
  };
  my_quizzes: {
    key: string;
    value: LocalSavedQuiz;
    indexes: { "by-date": string };
  };
}

const DB_NAME = "quickquiz_local_db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FastQuizDBSchema>> | null = null;

function getDB() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB<FastQuizDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("attempts")) {
          const attemptStore = db.createObjectStore("attempts", { keyPath: "id" });
          attemptStore.createIndex("by-date", "completedAt");
        }
        if (!db.objectStoreNames.contains("my_quizzes")) {
          const quizStore = db.createObjectStore("my_quizzes", { keyPath: "id" });
          quizStore.createIndex("by-date", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}

// === CÁC HÀM LƯU & TRUY VẤN LỊCH SỬ LÀM BÀI ===

export async function saveQuizAttempt(attempt: QuizAttemptRecord): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.put("attempts", attempt);
}

export async function getAllAttempts(): Promise<QuizAttemptRecord[]> {
  const db = await getDB();
  if (!db) return [];
  const list = await db.getAllFromIndex("attempts", "by-date");
  return list.reverse(); // Đưa lượt làm gần nhất lên đầu
}

export async function getAttemptById(id: string): Promise<QuizAttemptRecord | undefined> {
  const db = await getDB();
  if (!db) return undefined;
  return await db.get("attempts", id);
}

// === CÁC HÀM LƯU & TRUY VẤN BỘ ĐỀ TRẮC NGHIỆM ĐÃ TẠO ===

export async function saveLocalQuiz(quiz: LocalSavedQuiz): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.put("my_quizzes", quiz);
}

export async function getAllLocalQuizzes(): Promise<LocalSavedQuiz[]> {
  const db = await getDB();
  if (!db) return [];
  const list = await db.getAllFromIndex("my_quizzes", "by-date");
  return list.reverse();
}

export async function getLocalQuizById(id: string): Promise<LocalSavedQuiz | undefined> {
  const db = await getDB();
  if (!db) return undefined;
  return await db.get("my_quizzes", id);
}
