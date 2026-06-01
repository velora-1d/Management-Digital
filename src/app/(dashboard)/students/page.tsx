import StudentsPage, { InitialResult } from "./client";
import { getStudentsList } from "@/lib/students";

export default async function Page() {
  // Ambil halaman pertama data siswa aktif untuk initial render (page 1, no filter)
  const limit = 20;
  const initialResult = await getStudentsList({ page: 1, limit });

  return <StudentsPage initialResult={initialResult as InitialResult} />;
}
