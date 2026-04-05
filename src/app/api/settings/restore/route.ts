import { NextResponse, NextRequest } from "next/server";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    // Security fix: Disabled restore functionality due to SQL injection risks with sql.raw
    // Database restorations must be handled via proper external database administration tools.
    return NextResponse.json(
      { success: false, error: "Fitur restore database telah dinonaktifkan demi keamanan. Silakan lakukan restore menggunakan alat administrasi database eksternal." },
      { status: 501 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Restore error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: `Gagal mengakses endpoint: ${msg}` }, { status: 500 });
  }
}
