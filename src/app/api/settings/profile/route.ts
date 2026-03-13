import { NextResponse } from "next/server";
import { db } from "@/db";
import { schoolSettings } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";

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
    const settings = await db
      .select()
      .from(schoolSettings)
      .where(inArray(schoolSettings.key, PROFILE_KEYS));

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
    console.error("Settings profile GET error:", error);
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
        const [existing] = await db
          .select()
          .from(schoolSettings)
          .where(eq(schoolSettings.key, dbKey))
          .limit(1);

        if (existing) {
          await db
            .update(schoolSettings)
            .set({ value: body[bodyKey].toString(), updatedAt: new Date() })
            .where(eq(schoolSettings.id, existing.id));
        } else {
          await db
            .insert(schoolSettings)
            .values({ key: dbKey, value: body[bodyKey].toString() });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Profil madrasah diperbarui" });
  } catch (error) {
    console.error("Settings profile POST error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan profil madrasah" },
      { status: 500 }
    );
  }
}
