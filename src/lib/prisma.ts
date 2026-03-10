import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton — Optimized for Serverless (Vercel)
 * 
 * Menggunakan global singleton agar koneksi database tidak dibuat ulang
 * pada setiap invocation serverless function (mengurangi cold start).
 */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Simpan instance ke global agar bertahan antar invocation
// (penting untuk serverless: satu instance per container)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  // Di production (Vercel), tetap simpan ke global
  // agar container yang masih warm tidak buat koneksi baru
  globalForPrisma.prisma = prisma;
}
