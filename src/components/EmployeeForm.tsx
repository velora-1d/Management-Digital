"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" };

export default function EmployeeForm({ initialData, employeeType = "guru" }: { initialData?: any; employeeType?: "guru" | "staf" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;
  const d = initialData || {};
  const isGuru = employeeType === "guru";
  const backUrl = isGuru ? "/teachers" : "/staff";
  const apiUrl = isGuru ? "/api/teachers" : "/api/staff";

  const [f, setF] = useState({
    name: d.name || "",
    nip: d.nip || "",
    position: d.position || "",
    status: d.status || "aktif",
    phone: d.phone || "",
    address: d.address || "",
    joinDate: d.joinDate?.substring(0, 10) || "",
    baseSalary: d.baseSalary || 0,
  });

  const handleChange = (e: any) => setF({ ...f, [e.target.name]: e.target.value });

  const formatRp = (val: string) => {
    const num = val.replace(/\D/g, "");
    return num ? Number(num).toLocaleString("id-ID") : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) { Swal.fire("Perhatian", "Nama wajib diisi", "warning"); return; }
    setLoading(true);
    try {
      const url = isEdit ? `${apiUrl}/${d.id}` : apiUrl;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, type: employeeType }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Berhasil", json.message, "success").then(() => router.push(backUrl));
      } else {
        Swal.fire("Gagal", json.message || "Error", "error");
      }
    } catch { Swal.fire("Error", "Gagal menghubungi server", "error"); }
    finally { setLoading(false); }
  };

  const gradientColor = isGuru
    ? "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)"
    : "linear-gradient(135deg,#0ea5e9 0%,#0284c7 50%,#0369a1 100%)";

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ background: gradientColor, borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href={backUrl} style={{ width: 40, height: 40, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }} className="hover:bg-white/30">
            <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>
              {isEdit ? `Edit Data ${isGuru ? "Guru" : "Staf"}` : `Tambah ${isGuru ? "Guru" : "Staf"} Baru`}
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>
              Formulir data kepegawaian {isGuru ? "guru/tenaga pengajar" : "staf/tenaga kependidikan"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* A. Identitas */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "2rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 700, color: isGuru ? "#6366f1" : "#0ea5e9", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "1.5rem", height: "1.5rem", background: isGuru ? "#eef2ff" : "#e0f2fe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", color: isGuru ? "#4f46e5" : "#0284c7", fontWeight: 800 }}>A</span>
            Identitas Pegawai
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Nama Lengkap (Beserta Gelar) <span style={{ color: "#e11d48" }}>*</span></label>
              <input type="text" name="name" value={f.name} onChange={handleChange} required placeholder={isGuru ? "Contoh: Ahmad Dahlan, S.Pd." : "Contoh: Siti Aminah"} style={inputStyle} className="focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label style={labelStyle}>NIP / NUPTK</label>
              <input type="text" name="nip" value={f.nip} onChange={handleChange} placeholder="Contoh: 198001012010011001" style={inputStyle} className="focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label style={labelStyle}>Posisi / Jabatan <span style={{ color: "#e11d48" }}>*</span></label>
              <input type="text" name="position" value={f.position} onChange={handleChange} required placeholder={isGuru ? "Wali Kelas 1A / Guru PAI" : "Admin TU / Bendahara"} style={inputStyle} className="focus:border-indigo-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* B. Info Tambahan */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "2rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 700, color: "#eab308", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "1.5rem", height: "1.5rem", background: "#fef9c3", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", color: "#a16207", fontWeight: 800 }}>B</span>
            Informasi Tambahan
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Status Kepegawaian <span style={{ color: "#e11d48" }}>*</span></label>
              <select name="status" value={f.status} onChange={handleChange} required style={inputStyle} className="focus:border-indigo-500 bg-white">
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-Aktif / Cuti</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tanggal Bergabung</label>
              <input type="date" name="joinDate" value={f.joinDate} onChange={handleChange} style={inputStyle} className="focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label style={labelStyle}>No. HP / WhatsApp</label>
              <input type="text" name="phone" value={f.phone} onChange={handleChange} placeholder="08xx-xxxx-xxxx" style={inputStyle} className="focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label style={labelStyle}>Gaji Pokok (Rp)</label>
              <input type="text" name="baseSalary" value={f.baseSalary ? `Rp ${formatRp(String(f.baseSalary))}` : ""} onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setF({ ...f, baseSalary: raw ? Number(raw) : 0 });
              }} placeholder="Rp 0" style={inputStyle} className="focus:border-indigo-500 transition-colors" />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Alamat Domisili</label>
              <textarea name="address" value={f.address} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: "none" }} className="focus:border-indigo-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href={backUrl} style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", textDecoration: "none" }}>← Batal & Kembali</Link>
          <button type="submit" disabled={loading} style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 2rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: loading ? "#94a3b8" : gradientColor, border: "none", borderRadius: "0.625rem", cursor: loading ? "not-allowed" : "pointer" }} className="hover:opacity-90 transition-opacity">
            <svg style={{ width: "1rem", height: "1rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            {loading ? "Menyimpan..." : (isEdit ? "Update Data" : "Simpan Data")}
          </button>
        </div>
      </form>
    </div>
  );
}
