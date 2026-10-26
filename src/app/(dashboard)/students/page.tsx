import { cookies } from "next/headers";
import StudentsPage, { InitialResult } from "./client";
import { getStudentsList } from "@/lib/students";

export default async function Page() {
  const cookieStore = await cookies();
  const activeLevelCookie = cookieStore.get("active_school_level_id")?.value;
  const schoolLevelId = activeLevelCookie ? Number(activeLevelCookie) : 1;

  // Ambil halaman pertama data siswa aktif untuk initial render sesuai jenjang aktif
  const limit = 20;
  const initialResult = await getStudentsList({ page: 1, limit, schoolLevelId });

  return <StudentsPage initialResult={initialResult as InitialResult} />;
}
