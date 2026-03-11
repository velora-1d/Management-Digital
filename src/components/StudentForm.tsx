"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" };
const sectionHeaderStyle = (letter: string, label: string, color = "#6366f1") => (
  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 700, color, margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
    <span style={{ width: "1.5rem", height: "1.5rem", background: "#eef2ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", color: "#4f46e5", fontWeight: 800 }}>{letter}</span>
    {label}
  </h3>
);

const Field = ({ label, name, type = "text", required = false, span2 = false, placeholder = "", children, formData, onChange }: any) => (
  <div style={span2 ? { gridColumn: "span 2" } : {}}>
    <label style={labelStyle}>{label} {required && <span style={{ color: "#e11d48" }}>*</span>}</label>
    {children || <input type={type} name={name} value={(formData as any)[name]} onChange={onChange} required={required} placeholder={placeholder} style={inputStyle} className="focus:border-indigo-500 transition-colors" />}
  </div>
);

const Select = ({ label, name, required = false, options, formData, onChange }: { label: string; name: string; required?: boolean; options: [string, string][]; formData: any; onChange: any }) => (
  <div>
    <label style={labelStyle}>{label} {required && <span style={{ color: "#e11d48" }}>*</span>}</label>
    <select name={name} value={(formData as any)[name]} onChange={onChange} required={required} style={inputStyle} className="focus:border-indigo-500 bg-white">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  </div>
);

export default function StudentForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;
  const d = initialData || {};

  const [f, setF] = useState({
    // A. Identitas
    name: d.name || "", nisn: d.nisn || "", nis: d.nis || "", nik: d.nik || "", noKk: d.noKk || "",
    gender: d.gender || "L", religion: d.religion || "Islam",
    birthPlace: d.birthPlace || "", birthDate: d.birthDate?.substring(0, 10) || "",
    familyStatus: d.familyStatus || "", childPosition: d.childPosition || "", siblingCount: d.siblingCount || "",
    address: d.address || "", village: d.village || "", district: d.district || "",
    residenceType: d.residenceType || "", transportation: d.transportation || "",
    studentPhone: d.studentPhone || "", phone: d.phone || "",
    // B. Periodik
    height: d.height || "", weight: d.weight || "", distanceToSchool: d.distanceToSchool || "", travelTime: d.travelTime || "",
    // C. Orang Tua
    fatherName: d.fatherName || "", fatherNik: d.fatherNik || "",
    fatherBirthPlace: d.fatherBirthPlace || "", fatherBirthDate: d.fatherBirthDate?.substring(0, 10) || "",
    fatherEducation: d.fatherEducation || "", fatherOccupation: d.fatherOccupation || "",
    motherName: d.motherName || "", motherNik: d.motherNik || "",
    motherBirthPlace: d.motherBirthPlace || "", motherBirthDate: d.motherBirthDate?.substring(0, 10) || "",
    motherEducation: d.motherEducation || "", motherOccupation: d.motherOccupation || "",
    parentIncome: d.parentIncome || "",
    // D. Wali
    guardianName: d.guardianName || "", guardianNik: d.guardianNik || "",
    guardianBirthPlace: d.guardianBirthPlace || "", guardianBirthDate: d.guardianBirthDate?.substring(0, 10) || "",
    guardianEducation: d.guardianEducation || "", guardianOccupation: d.guardianOccupation || "",
    guardianAddress: d.guardianAddress || "", guardianPhone: d.guardianPhone || "",
    // E. Administrasi
    category: d.category || "reguler", status: d.status || "aktif", classroomId: d.classroomId || "",
    infaqStatus: d.infaqStatus || "reguler", infaqNominal: d.infaqNominal || 0,
  });

  const handleChange = (e: any) => setF({ ...f, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEdit ? `/api/students/${d.id}` : "/api/students";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Berhasil", json.message, "success").then(() => router.push("/students"));
      } else {
        Swal.fire("Gagal", json.message || "Error", "error");
      }
    } catch { Swal.fire("Error", "Gagal menghubungi server", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/students" style={{ width: 40, height: 40, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }} className="hover:bg-white/30">
            <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>{isEdit ? "Edit Siswa" : "Tambah Siswa Baru"}</h2>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Formulir lengkap data siswa (Format Dapodik)</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* A. Identitas Murid */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "2rem", marginBottom: "1.5rem" }}>
          {sectionHeaderStyle("A", "Identitas Murid")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <Field label="Nama Lengkap (Sesuai Akta)" name="name" required span2 formData={f} onChange={handleChange} />
            <Field label="NISN" name="nisn" formData={f} onChange={handleChange} />
            <Field label="NIS" name="nis" formData={f} onChange={handleChange} />
            <Field label="NIK (No. Induk Kependudukan)" name="nik" formData={f} onChange={handleChange} />
            <Field label="No. KK" name="noKk" formData={f} onChange={handleChange} />
            <Select label="Jenis Kelamin" name="gender" required options={[["L", "Laki-laki (Putra)"], ["P", "Perempuan (Putri)"]]} formData={f} onChange={handleChange} />
            <Select label="Agama" name="religion" options={[["Islam", "Islam"], ["Kristen", "Kristen"], ["Katolik", "Katolik"], ["Hindu", "Hindu"], ["Buddha", "Buddha"], ["Konghucu", "Konghucu"]]} formData={f} onChange={handleChange} />
            <Field label="Tempat Lahir" name="birthPlace" formData={f} onChange={handleChange} />
            <Field label="Tanggal Lahir" name="birthDate" type="date" formData={f} onChange={handleChange} />
            <Field label="Status dalam Keluarga" name="familyStatus" placeholder="Anak Kandung / Anak Angkat" formData={f} onChange={handleChange} />
            <Field label="Anak Ke-" name="childPosition" type="number" formData={f} onChange={handleChange} />
            <Field label="Jumlah Saudara" name="siblingCount" type="number" formData={f} onChange={handleChange} />
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Alamat Murid</label>
              <textarea name="address" value={f.address} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: "none" }} className="focus:border-indigo-500 transition-colors" />
            </div>
            <Field label="Desa / Kelurahan" name="village" formData={f} onChange={handleChange} />
            <Field label="Kecamatan" name="district" formData={f} onChange={handleChange} />
            <Select label="Tempat Tinggal Siswa" name="residenceType" options={[["", "-- Pilih --"], ["Orang tua", "Bersama Orang Tua"], ["Kerabat", "Bersama Kerabat/Wali"], ["Kos", "Kos / Asrama"], ["Lainnya", "Lainnya"]]} formData={f} onChange={handleChange} />
            <Select label="Alat Transportasi" name="transportation" options={[["", "-- Pilih --"], ["Motor", "Motor"], ["Jalan kaki", "Jalan Kaki"], ["Jemputan Sekolah", "Jemputan Sekolah"], ["Kendaraan Umum", "Angkutan Umum"], ["Lainnya", "Lainnya"]]} formData={f} onChange={handleChange} />
            <Field label="No. HP Siswa (Jika Ada)" name="studentPhone" formData={f} onChange={handleChange} />
            <Field label="No. HP Kontak Orang Tua" name="phone" formData={f} onChange={handleChange} />
          </div>
        </div>

        {/* B. Data Periodik Fisik */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "2rem", marginBottom: "1.5rem" }}>
          {sectionHeaderStyle("B", "Data Periodik Fisik", "#0ea5e9")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1.25rem" }}>
            <Field label="Tinggi Badan (cm)" name="height" type="number" formData={f} onChange={handleChange} />
            <Field label="Berat Badan (kg)" name="weight" type="number" formData={f} onChange={handleChange} />
            <Select label="Jarak ke Sekolah" name="distanceToSchool" options={[["", "-- Pilih --"], ["< 1 km", "Kurang dari 1 km"], ["1-3 km", "1 - 3 km"], ["3-5 km", "3 - 5 km"], ["> 5 km", "Lebih dari 5 km"]]} formData={f} onChange={handleChange} />
            <Field label="Waktu Tempuh (Menit)" name="travelTime" type="number" formData={f} onChange={handleChange} />
          </div>
        </div>

        {/* C. Identitas Orang Tua */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "2rem", marginBottom: "1.5rem" }}>
          {sectionHeaderStyle("C", "Identitas Orang Tua", "#eab308")}
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
          <div style={{ marginTop: "1.5rem" }}>
            <Select label="Penghasilan Rata-rata Gabungan Orang Tua" name="parentIncome" options={[["", "-- Pilih Range --"], ["< 1 jt", "Kurang dari Rp 1.000.000"], ["1-2 jt", "Rp 1.000.000 - Rp 2.000.000"], ["2-3 jt", "Rp 2.000.000 - Rp 3.000.000"], ["> 3 jt", "Lebih dari Rp 3.000.000"]]} formData={f} onChange={handleChange} />
          </div>
        </div>

        {/* D. Wali Murid */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "2rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            {sectionHeaderStyle("D", "Wali Murid (Jika Bersama Wali)", "#ec4899")}
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
              <textarea name="guardianAddress" value={f.guardianAddress} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: "none" }} className="focus:border-indigo-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* E. Administrasi Internal */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "2rem", marginBottom: "1.5rem" }}>
          {sectionHeaderStyle("E", "Status & Administrasi Internal", "#8b5cf6")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
            <Select label="Kategori Biaya" name="category" required options={[["reguler", "Reguler (Wajib Bayar)"], ["kurang_mampu", "Kurang Mampu"], ["yatim_piatu", "Yatim / Piatu"]]} formData={f} onChange={handleChange} />
            <Select label="Status Siswa" name="status" required options={[["aktif", "Aktif"], ["lulus", "Lulus"], ["pindah", "Pindah"], ["nonaktif", "Nonaktif"]]} formData={f} onChange={handleChange} />
            {f.category !== "reguler" ? (
              <Select label="Skema Infaq/SPP" name="infaqStatus" options={[["bayar_penuh", "Bayar Penuh"], ["potongan", "Potongan (Nominal Custom)"], ["gratis", "Gratis (Rp 0)"]]} formData={f} onChange={handleChange} />
            ) : (
              <div>
                <label style={labelStyle}>Skema Infaq/SPP</label>
                <div style={{ ...inputStyle, background: "#f1f5f9", color: "#64748b", display: "flex", alignItems: "center" }}>Wajib Bayar Penuh</div>
              </div>
            )}
          </div>
          {f.category !== "reguler" && f.infaqStatus === "potongan" && (
            <div style={{ marginTop: "1.25rem", maxWidth: "33%" }}>
              <label style={labelStyle}>Nominal Infaq/SPP Custom <span style={{ color: "#e11d48" }}>*</span></label>
              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", overflow: "hidden" }}>
                <span style={{ padding: "0.625rem 0.75rem", background: "#f8fafc", color: "#64748b", fontWeight: 700, fontSize: "0.8125rem", borderRight: "1.5px solid #e2e8f0" }}>Rp</span>
                <input type="number" name="infaqNominal" value={f.infaqNominal} onChange={handleChange} min="0" style={{ flex: 1, padding: "0.625rem 0.875rem", border: "none", outline: "none", fontSize: "0.8125rem" }} />
              </div>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.375rem" }}>Nominal SPP khusus untuk siswa ini (bukan tarif kelas)</p>
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/students" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", textDecoration: "none" }}>← Batal & Kembali</Link>
          <button type="submit" disabled={loading} style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 2rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: loading ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: "0.625rem", cursor: loading ? "not-allowed" : "pointer" }} className="hover:opacity-90 transition-opacity">
            <svg style={{ width: "1rem", height: "1rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            {loading ? "Menyimpan..." : (isEdit ? "Update Data Siswa" : "Simpan Data Siswa")}
          </button>
        </div>
      </form>
    </div>
  );
}
