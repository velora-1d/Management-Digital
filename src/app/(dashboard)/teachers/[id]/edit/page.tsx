"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EmployeeForm from "@/components/EmployeeForm";

export default function TeacherEditPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/teachers/${params.id}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [params.id]);

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>Memuat data guru...</div>;
  if (!data) return <div style={{ padding: "3rem", textAlign: "center", color: "#e11d48" }}>Data guru tidak ditemukan</div>;

  return <EmployeeForm initialData={data} employeeType="guru" />;
}
