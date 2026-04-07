import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Fitur restore database melalui aplikasi telah dinonaktifkan untuk alasan keamanan. Silakan gunakan tool manajemen database (seperti pgAdmin atau psql) untuk melakukan restore data.",
    },
    { status: 501 }
  );
}
