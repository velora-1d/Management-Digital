import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/users/[id]/toggle — Toggle status aktif/nonaktif user
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const params = await props.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    // Tidak bisa toggle diri sendiri
    if (currentUser.userId === id) {
      return NextResponse.json({ success: false, message: "Tidak bisa menonaktifkan akun sendiri" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }

    const newStatus = user.status === "active" ? "inactive" : "active";

    await prisma.user.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.name} sekarang ${newStatus === "active" ? "aktif" : "nonaktif"}.`,
      data: { status: newStatus },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal toggle status user" }, { status: 500 });
  }
}
