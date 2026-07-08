import { NextResponse } from "next/server";
import { getBuildId } from "@/lib/version";

export const dynamic = "force-dynamic";

/**
 * Endpoint API untuk mendapatkan build ID server terbaru.
 * Digunakan oleh client-side untuk membandingkan versi build client vs server secara periodik.
 */
export async function GET() {
  try {
    const version = getBuildId();
    return NextResponse.json({ version });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil versi build" },
      { status: 500 }
    );
  }
}
