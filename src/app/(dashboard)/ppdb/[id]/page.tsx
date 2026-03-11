"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { UserPlus } from "lucide-react";

const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" };

const SectionHeader = ({ letter, label, color = "#0ea5e9" }: { letter: string; label: string; color?: string }) => (
  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 700, color, margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
    <span style={{ width: "1.5rem", height: "1.5rem", background: "#e0f2fe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", color: "#0284c7", fontWeight: 800 }}>{letter}</span>
    {label}
  </h3>
);

const Field = ({ label, name, type = "text", required = false, span2 = false, placeholder = "", children, formData, onChange }: any) => (
  <div style={span2 ? { gridColumn: "span 2" } : {}}>
    <label style={labelStyle}>{label} {required && <span style={{ color: "#e11d48" }}>*</span>}</label>
    {children || <input type={type} name={name} value={(formData as any)[name] || ""} onChange={onChange} required={required} placeholder={placeholder} style={inputStyle} className="focus:border-sky-500 transition-colors bg-white text-slate-800" />}
  </div>
);

const Select = ({ label, name, required = false, options, formData, onChange }: { label: string; name: string; required?: boolean; options: [string, string][]; formData: any; onChange: any }) => (
  <div>
    <label style={labelStyle}>{label} {required && <span style={{ color: "#e11d48" }}>*</span>}</label>
    <select name={name} value={(formData as any)[name] || ""} onChange={onChange} required={required} style={inputStyle} className="focus:border-sky-500 bg-white text-slate-800">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  </div>
);

export default function PpdbEditPage(props: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const params = use(props.params);
  const regId = params.id;

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  const [f, setF] = useState({
    // Identitas
    name: "", gender: "L", birthPlace: "", birthDate: "", nik: "", noKk: "", nisn: "",
    religion: "Islam", familyStatus: "", childPosition: "", siblingCount: "",
    address: "", village: "", district: "",
    residenceType: "", transportation: "", previousSchool: "", studentPhone: "", phone: "",
    // Periodik
    height: "", weight: "", distanceToSchool: "", travelTime: "",
    // Orang Tua
    fatherName: "", fatherNik: "", fatherBirthPlace: "", fatherBirthDate: "",
    fatherEducation: "", fatherOccupation: "",
    motherName: "", motherNik: "", motherBirthPlace: "", motherBirthDate: "",
    motherEducation: "", motherOccupation: "", parentIncome: "",
    // Wali
    guardianName: "", guardianNik: "", guardianBirthPlace: "", guardianBirthDate: "",
    guardianEducation: "", guardianOccupation: "", guardianAddress: "", guardianPhone: "",
    // Catatan
    notes: "",
  });

  useEffect(() => {
    fetch(`/api/ppdb/${regId}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          const d = json.data;
          setF(prev => ({ ...prev, ...d }));
        }
      })
      .finally(() => setInitLoading(false));
  }, [regId]);

  const handleChange = (e: any) => setF({ ...f, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/ppdb/${regId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Berhasil", "Data pendaftar berhasil diperbarui!", "success").then(() => router.push("/ppdb"));
      } else {
        Swal.fire("Gagal", json.message || "Error", "error");
      }
    } catch { Swal.fire("Error", "Gagal menghubungi server", "error"); }
    finally { setLoading(false); }
  };

  if (initLoading) {
    return <div className="p-8 text-center text-slate-500 text-sm font-semibold animate-pulse">Memuat data pendaftar...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ maxWidth: "100%" }}>
      {/* Header */}
      <PageHeader
        title="Edit Detail PPDB"
        subtitle="Silakan ubah data pendaftar pada form di bawah ini"
        icon={<UserPlus />}
        gradient="from-indigo-500 to-indigo-600"
        actions={
          <Link href="/ppdb" className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-xs uppercase tracking-wider border border-white/30 transition-all text-decoration-none">
            <svg style={{ width: "1rem", height: "1rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Kembali
          </Link>
        }
      />

      <form onSubmit={handleSubmit}>
        {/* A. Identitas Calon Murid */}
        <Card className="p-8 mb-6">
          <SectionHeader letter="A" label="Identitas Calon Murid" color="#4f46e5" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <Field label="Nama Lengkap (Sesuai Akta)" name="name" required span2 formData={f} onChange={handleChange} />
            <Field label="Tempat Lahir" name="birthPlace" formData={f} onChange={handleChange} />
            <Field label="Tanggal Lahir" name="birthDate" type="date" formData={f} onChange={handleChange} />
            <Field label="NIK (No. Induk Kependudukan)" name="nik" formData={f} onChange={handleChange} />
            <Field label="No. KK" name="noKk" formData={f} onChange={handleChange} />
            <Select label="Jenis Kelamin" name="gender" required options={[["L", "Laki-laki (Putra)"], ["P", "Perempuan (Putri)"]]} formData={f} onChange={handleChange} />
            <Select label="Agama" name="religion" options={[["Islam", "Islam"], ["Kristen", "Kristen"], ["Katolik", "Katolik"], ["Hindu", "Hindu"], ["Buddha", "Buddha"], ["Konghucu", "Konghucu"]]} formData={f} onChange={handleChange} />
            <Field label="Status dalam Keluarga" name="familyStatus" placeholder="Anak Kandung / Anak Angkat" formData={f} onChange={handleChange} />
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Field label="Anak Ke-" name="childPosition" type="number" formData={f} onChange={handleChange} />
                <Field label="Jml. Saudara" name="siblingCount" type="number" formData={f} onChange={handleChange} />
              </div>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Alamat Murid</label>
              <textarea name="address" value={f.address || ""} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: "none" }} className="focus:border-sky-500 transition-colors bg-white text-slate-800" />
            </div>
            <Field label="Desa / Kelurahan" name="village" formData={f} onChange={handleChange} />
            <Field label="Kecamatan" name="district" formData={f} onChange={handleChange} />
            <Select label="Tempat Tinggal Siswa" name="residenceType" options={[["", "-- Pilih --"], ["Orang tua", "Bersama Orang Tua"], ["Kerabat", "Bersama Kerabat/Wali"], ["Kos", "Kos / Asrama"], ["Lainnya", "Lainnya"]]} formData={f} onChange={handleChange} />
            <Select label="Alat Transportasi" name="transportation" options={[["", "-- Pilih --"], ["Motor", "Motor"], ["Jalan kaki", "Jalan Kaki"], ["Jemputan Sekolah", "Jemputan Sekolah"], ["Kendaraan Umum", "Angkutan Umum"], ["Lainnya", "Lainnya"]]} formData={f} onChange={handleChange} />
            <Field label="Asal Sekolah (TK/RA) Sebelumnya" name="previousSchool" formData={f} onChange={handleChange} />
            <Field label="No. HP Siswa (Jika Ada)" name="studentPhone" formData={f} onChange={handleChange} />
          </div>
        </Card>

        {/* B. Data Periodik Fisik */}
        <Card className="p-8 mb-6">
          <SectionHeader letter="B" label="Data Periodik Fisik" color="#4f46e5" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1.25rem" }}>
            <Field label="Tinggi Badan (cm)" name="height" type="number" formData={f} onChange={handleChange} />
            <Field label="Berat Badan (kg)" name="weight" type="number" formData={f} onChange={handleChange} />
            <Select label="Jarak ke Sekolah" name="distanceToSchool" options={[["", "-- Pilih --"], ["< 1 km", "Kurang dari 1 km"], ["1-3 km", "1 - 3 km"], ["3-5 km", "3 - 5 km"], ["> 5 km", "Lebih dari 5 km"]]} formData={f} onChange={handleChange} />
            <Field label="Waktu Tempuh (Menit)" name="travelTime" type="number" formData={f} onChange={handleChange} />
          </div>
        </Card>

        {/* C. Identitas Orang Tua */}
        <Card className="p-8 mb-6">
          <SectionHeader letter="C" label="Identitas Orang Tua" color="#4f46e5" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {/* Kolom Ayah */}
            <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
              <h5 style={{ fontWeight: 700, color: "#475569", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.5rem", marginBottom: "1rem", fontSize: "0.8125rem" }}>Data Ayah Kandung</h5>
              <div style={{ display: "grid", gap: "1rem" }}>
                <Field label="Nama Ayah" name="fatherName" formData={f} onChange={handleChange} />
                <Field label="NIK Ayah" name="fatherNik" formData={f} onChange={handleChange} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="Tempat Lahir" name="fatherBirthPlace" formData={f} onChange={handleChange} />
                  <Field label="Tgl Lahir" name="fatherBirthDate" type="date" formData={f} onChange={handleChange} />
                </div>
                <Field label="Pendidikan" name="fatherEducation" placeholder="SD / SMP / SMA / S1 / S2" formData={f} onChange={handleChange} />
                <Field label="Pekerjaan" name="fatherOccupation" formData={f} onChange={handleChange} />
              </div>
            </div>
            {/* Kolom Ibu */}
            <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
              <h5 style={{ fontWeight: 700, color: "#475569", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.5rem", marginBottom: "1rem", fontSize: "0.8125rem" }}>Data Ibu Kandung</h5>
              <div style={{ display: "grid", gap: "1rem" }}>
                <Field label="Nama Ibu" name="motherName" formData={f} onChange={handleChange} />
                <Field label="NIK Ibu" name="motherNik" formData={f} onChange={handleChange} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="Tempat Lahir" name="motherBirthPlace" formData={f} onChange={handleChange} />
                  <Field label="Tgl Lahir" name="motherBirthDate" type="date" formData={f} onChange={handleChange} />
                </div>
                <Field label="Pendidikan" name="motherEducation" placeholder="SD / SMP / SMA / S1 / S2" formData={f} onChange={handleChange} />
                <Field label="Pekerjaan" name="motherOccupation" formData={f} onChange={handleChange} />
              </div>
            </div>
          </div>
          <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <Field label="Nama Orang Tua / Perwakilan" name="fatherName" formData={f} onChange={handleChange} />
            <Field label="No. Kontak Ortu (WA/HP Aktif)" name="phone" formData={f} onChange={handleChange} />
            <Select label="Penghasilan Rata-rata Gabungan" name="parentIncome" options={[["", "-- Pilih Range --"], ["< 1 jt", "Kurang dari Rp 1.000.000"], ["1-2 jt", "Rp 1.000.000 - Rp 2.000.000"], ["2-3 jt", "Rp 2.000.000 - Rp 3.000.000"], ["> 3 jt", "Lebih dari Rp 3.000.000"]]} formData={f} onChange={handleChange} />
          </div>
        </Card>

        {/* D. Wali Murid */}
        <Card className="p-8 mb-6">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <SectionHeader letter="D" label="Wali Murid (Jika Bersama Wali)" color="#4f46e5" />
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Kosongkan jika bersama orang tua kandung.</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <Field label="Nama Wali" name="guardianName" span2 formData={f} onChange={handleChange} />
            <Field label="NIK Wali" name="guardianNik" formData={f} onChange={handleChange} />
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Field label="Tempat Lahir" name="guardianBirthPlace" formData={f} onChange={handleChange} />
                <Field label="Tgl Lahir" name="guardianBirthDate" type="date" formData={f} onChange={handleChange} />
              </div>
            </div>
            <Field label="Pendidikan" name="guardianEducation" formData={f} onChange={handleChange} />
            <Field label="Pekerjaan" name="guardianOccupation" formData={f} onChange={handleChange} />
            <Field label="No. Kontak Wali" name="guardianPhone" formData={f} onChange={handleChange} />
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Alamat Wali</label>
              <textarea name="guardianAddress" value={f.guardianAddress || ""} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: "none" }} className="focus:border-sky-500 transition-colors bg-white text-slate-800" />
            </div>
          </div>
        </Card>

        {/* E. Catatan */}
        <Card className="p-8 mb-6">
          <SectionHeader letter="E" label="Tambahan & Catatan" color="#4f46e5" />
          <div>
            <label style={labelStyle}>Catatan Khusus (Riwayat Medis / Keadaan Tertentu)</label>
            <textarea name="notes" value={f.notes || ""} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: "none" }} className="focus:border-sky-500 transition-colors bg-white text-slate-800" />
          </div>
        </Card>

        {/* Submit */}
        <Card className="p-6 flex flex-wrap justify-between items-center gap-4">
          <Link href="/ppdb" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", textDecoration: "none" }}>← Batal & Kembali</Link>
          <button type="submit" disabled={loading} style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 2rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: loading ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: "0.625rem", cursor: loading ? "not-allowed" : "pointer" }} className="hover:opacity-90 transition-opacity">
            <svg style={{ width: "1rem", height: "1rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            {loading ? "Menyimpan..." : "Simpan Perubahan Data"}
          </button>
        </Card>
      </form>
    </div>
  );
}
