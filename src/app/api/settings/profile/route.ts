import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


const PROFILE_KEYS = [
  "school_name",
  "school_phone",
  "school_email",
  "school_logo",
  "school_address",
  "headmaster_name",
  "headmaster_nip"
];

export async function GET() {
  try {
    const settings = await prisma.schoolSetting.findMany({
      where: { key: { in: PROFILE_KEYS } },
    });

    const profile: Record<string, string> = {
      name: "",
      phone: "",
      email: "",
      logo: "",
      address: "",
      headmaster_name: "",
      headmaster_nip: ""
    };

    settings.forEach((s) => {
      if (s.key === "school_name") profile.name = s.value;
      if (s.key === "school_phone") profile.phone = s.value;
      if (s.key === "school_email") profile.email = s.value;
      if (s.key === "school_logo") profile.logo = s.value;
      if (s.key === "school_address") profile.address = s.value;
      if (s.key === "headmaster_name") profile.headmaster_name = s.value;
      if (s.key === "headmaster_nip") profile.headmaster_nip = s.value;
    });

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil profil madrasah" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mapKeys: Record<string, string> = {
      name: "school_name",
      phone: "school_phone",
      email: "school_email",
      logo: "school_logo",
      address: "school_address",
      headmaster_name: "headmaster_name",
      headmaster_nip: "headmaster_nip"
    };

    for (const [bodyKey, dbKey] of Object.entries(mapKeys)) {
      if (body[bodyKey] !== undefined) {
        const existing = await prisma.schoolSetting.findFirst({
          where: { key: dbKey },
        });

        if (existing) {
          await prisma.schoolSetting.update({
            where: { id: existing.id },
            data: { value: body[bodyKey].toString() },
          });
        } else {
          await prisma.schoolSetting.create({
            data: { key: dbKey, value: body[bodyKey].toString() },
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Profil madrasah diperbarui" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menyimpan profil madrasah" },
      { status: 500 }
    );
  }
}
