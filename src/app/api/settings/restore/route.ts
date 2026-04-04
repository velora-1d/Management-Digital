import { NextResponse } from "next/server";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

export async function POST() {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    return NextResponse.json(
      {
        success: false,
        error: "Fitur restore database melalui aplikasi telah dinonaktifkan demi keamanan. Silakan gunakan alat manajemen database eksternal (seperti pgAdmin atau psql) untuk melakukan restore dari file .sql."
      },
      { status: 501 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Restore error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: `Gagal memproses request: ${msg}` }, { status: 500 });
  }
}
