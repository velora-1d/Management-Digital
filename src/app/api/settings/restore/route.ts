import { NextResponse, NextRequest } from "next/server";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    // Security Fix: Database restore feature disabled due to severe SQL Injection risks
    // Parsing and executing raw SQL (.sql dumps) via Drizzle's sql.raw() is a critical vulnerability.
    // Database restore operations must be handled externally via proper tools (e.g. pg_restore, Neon console)
    return NextResponse.json(
      {
        success: false,
        error: "Fitur restore database dinonaktifkan demi keamanan. Silakan gunakan tools database eksternal untuk melakukan restore."
      },
      { status: 501 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Restore error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: `Gagal mengakses endpoint restore: ${msg}` }, { status: 500 });
  }
}
