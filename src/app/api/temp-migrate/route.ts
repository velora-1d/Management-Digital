import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    console.log("🚀 Menjalankan Migrasi SQL Sementara...");
    
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
      message: "✅ DATABASE BERHASIL DIMIGRASI! Kolom NIS/NISN/NIK/NoKK sekarang Nullable." 
    });
  } catch (error) {
    console.error("❌ GAGAL MIGRASI SEMENTARA:", error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Gagal migrasi" 
    }, { status: 500 });
  }
}
