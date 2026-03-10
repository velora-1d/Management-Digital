"use client";
import { useState, useEffect, use } from "react";
import StudentForm from "@/components/StudentForm";

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/students/${resolvedParams.id}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
        else setError(true);
      })
      .catch(() => setError(true));
  }, [resolvedParams.id]);

  if (error) return <div className="p-8 text-center text-red-500">Gagal memuat data siswa/Siswa tidak ditemukan.</div>;
  if (!data) return <div className="p-8 text-center text-slate-500">Memuat detail siswa...</div>;

  return <StudentForm initialData={data} />;
}
