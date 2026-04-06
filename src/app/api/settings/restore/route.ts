import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // 🛡️ Sentinel: Disabled due to CRITICAL SQL Injection vulnerability.
  // Using sql.raw() with user-uploaded file contents is unsafe and allows
  // arbitrary SQL execution. Database restores should be handled externally
  // via proper database management tools (e.g., pg_restore).
  return NextResponse.json(
    { success: false, error: "Fitur restore database dinonaktifkan demi keamanan. Silakan gunakan tool database eksternal." },
    { status: 501 }
  );
}
