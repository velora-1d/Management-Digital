"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { School, Save } from "lucide-react";

const profileKeys = [
  { key: "nama_sekolah", label: "Nama Sekolah", type: "text" },
  { key: "npsn", label: "NPSN", type: "text" },
  { key: "nss", label: "NSS", type: "text" },
  { key: "jenjang", label: "Jenjang", type: "select", options: ["SD", "SMP", "SMA", "SMK", "MI", "MTs", "MA"] },
  { key: "alamat_sekolah", label: "Alamat", type: "textarea" },
  { key: "kelurahan", label: "Kelurahan/Desa", type: "text" },
  { key: "kecamatan", label: "Kecamatan", type: "text" },
  { key: "kabupaten", label: "Kabupaten/Kota", type: "text" },
  { key: "provinsi", label: "Provinsi", type: "text" },
  { key: "kode_pos", label: "Kode Pos", type: "text" },
  { key: "telepon", label: "Telepon", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "website", label: "Website", type: "text" },
  { key: "kepala_sekolah", label: "Nama Kepala Sekolah", type: "text" },
  { key: "nip_kepala_sekolah", label: "NIP Kepala Sekolah", type: "text" },
];

export default function SchoolProfilePage() {
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/school-profile");
      const d = await res.json();
      setProfile(d || {});
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/school-profile", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      Swal.fire("Berhasil", "Profil sekolah berhasil disimpan", "success");
    } catch { Swal.fire("Error", "Gagal menyimpan", "error"); }
    setSaving(false);
  };

  const updateField = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Sekolah"
        subtitle="Informasi dan profil resmi instansi / lembaga sekolah"
        icon={<School />}
        actions={
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50">
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <Save className="w-4 h-4" />}
            Simpan Profil
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-gray-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <h2 className="font-heading font-bold text-sm text-slate-800">Data Sekolah</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileKeys.map(pk => (
                <div key={pk.key} className={pk.type === "textarea" ? "md:col-span-2" : ""}>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">{pk.label}</label>
                  {pk.type === "textarea" ? (
                    <textarea value={profile[pk.key] || ""} onChange={e => updateField(pk.key, e.target.value)} rows={2}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                  ) : pk.type === "select" ? (
                    <select value={profile[pk.key] || ""} onChange={e => updateField(pk.key, e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="">— Pilih —</option>
                      {pk.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input value={profile[pk.key] || ""} onChange={e => updateField(pk.key, e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Preview Kop Surat */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <h2 className="font-heading font-bold text-sm text-slate-800">Preview Kop Surat</h2>
            </div>
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-2 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <p className="font-bold text-sm text-slate-800">{profile["nama_sekolah"] || "Nama Sekolah"}</p>
              {profile["npsn"] && <p className="text-[11px] text-slate-500">NPSN: {profile["npsn"]}</p>}
              <p className="text-[11px] text-slate-500">{profile["alamat_sekolah"] || "Alamat Sekolah"}</p>
              {(profile["kelurahan"] || profile["kecamatan"]) && (
                <p className="text-[11px] text-slate-500">{[profile["kelurahan"], profile["kecamatan"], profile["kabupaten"]].filter(Boolean).join(", ")}</p>
              )}
              {(profile["telepon"] || profile["email"]) && (
                <p className="text-[11px] text-slate-500">
                  {profile["telepon"] && `Telp: ${profile["telepon"]}`}
                  {profile["telepon"] && profile["email"] && " · "}
                  {profile["email"] && `Email: ${profile["email"]}`}
                </p>
              )}
              <div className="border-t border-slate-300 mt-3 pt-1"></div>
              <div className="border-t border-slate-200"></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 text-center">Preview ini akan digunakan di dokumen surat dan rapor</p>
          </Card>
        </div>
      )}
    </div>
  );
}
