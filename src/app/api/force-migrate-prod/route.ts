import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    console.log("🚀 Menjalankan Migrasi Produksi (NIS Nullable)...");
    
    // Perintah sakti untuk merubah kolom secara langsung di production
    await db.execute(sql`ALTER TABLE students ALTER COLUMN nis DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE students ALTER COLUMN nis SET DEFAULT NULL;`);
    await db.execute(sql`ALTER TABLE students ALTER COLUMN nisn DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE students ALTER COLUMN nisn SET DEFAULT NULL;`);
    await db.execute(sql`ALTER TABLE students ALTER COLUMN nik DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE students ALTER COLUMN nik SET DEFAULT NULL;`);
    await db.execute(sql`ALTER TABLE students ALTER COLUMN no_kk DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE students ALTER COLUMN no_kk SET DEFAULT NULL;`);

    return NextResponse.json({ 
      success: true, 
      message: "✅ DATABASE PRODUCTION BERHASIL DIMIGRASI! Masalah NIS selesai." 
    });
  } catch (error) {
    console.error("❌ GAGAL MIGRASI PROD:", error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Gagal migrasi produksi" 
    }, { status: 500 });
  }
}
