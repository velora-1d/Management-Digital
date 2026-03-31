import { NextResponse, NextRequest } from "next/server";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    return NextResponse.json(
      {
        success: false,
        error: "Fitur restore dinonaktifkan untuk alasan keamanan. Gunakan alat administrasi database (contoh: psql) untuk memulihkan backup.",
      },
      { status: 501 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Restore error:", error);
    return NextResponse.json({ success: false, error: "Gagal restore data" }, { status: 500 });
  }
}
