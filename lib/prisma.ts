// Khởi tạo Prisma Client cho PostgreSQL với xử lý an toàn
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
}

const isDatabaseConfigured = !!process.env.DATABASE_URL;

export const prisma: PrismaClient | null = isDatabaseConfigured
  ? global.globalPrisma || new PrismaClient()
  : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  global.globalPrisma = prisma;
}
