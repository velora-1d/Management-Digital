"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import LeftDrawer from "@/components/ui/LeftDrawer";
import { School, Save, Upload, Building2, MapPin, Phone, UserCheck, Image as ImageIcon, SlidersHorizontal, Loader2 } from "lucide-react";
import { ensureHttpsUrl } from "@/lib/url";

export default function SchoolProfileClient({ initialData }: { initialData: Record<string, string> }) {
  const [profile, setProfile] = useState<Record<string, string>>(initialData || {});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"identitas" | "alamat" | "kontak" | "pimpinan" | "logo">("identitas");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/school-profile");
      const d = await res.json();
      setProfile(d || {});
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/school-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        Swal.fire({
          title: "Berhasil",
          text: "Profil madrasah berhasil disimpan",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        if (isDrawerOpen) setIsDrawerOpen(false);
      } else {
        Swal.fire("Gagal", "Gagal menyimpan profil sekolah", "error");
      }
    } catch { 
      Swal.fire("Error", "Gagal menghubungi server", "error"); 
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const sections = [
    { id: "identitas", label: "Identitas Madrasah", icon: Building2, desc: "Nama resmi, NPSN, NSS, Jenjang" },
    { id: "alamat", label: "Alamat & Wilayah", icon: MapPin, desc: "Alamat jalan, kelurahan, kecamatan" },
    { id: "kontak", label: "Kontak & Media", icon: Phone, desc: "Telepon, email, website resmi" },
    { id: "pimpinan", label: "Kepala Madrasah", icon: UserCheck, desc: "Nama kepala madrasah dan NIP" },
    { id: "logo", label: "Logo & Lambang", icon: ImageIcon, desc: "Unggah logo resmi madrasah" },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Profil Madrasah"
        subtitle="Kelola informasi identitas, legalitas, dan format kop surat resmi madrasah."
        icon={<School className="w-5 h-5 text-blue-600" />}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              Edit di Drawer
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Profil</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs text-slate-500 font-medium">Memuat profil sekolah...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Panel Sisi Kiri (Navigation Tabs) */}
          <div className="lg:col-span-3 space-y-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Bagian Profil</h4>
              <p className="text-[11px] text-slate-400">Pilih menu navigasi panel kiri</p>
            </div>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                    isActive
                      ? "bg-blue-50 border border-blue-200 text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{sec.label}</span>
                    <span className="text-[11px] text-slate-400 font-normal leading-tight block mt-0.5">{sec.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form Content Berdasarkan Panel Kiri Terpilih */}
          <div className="lg:col-span-5">
            <Card className="space-y-4">
              {activeSection === "identitas" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800">Identitas Madrasah</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Nama dan kode registrasi kelembagaan</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Nama Sekolah / Madrasah *</label>
                    <input
                      type="text"
                      value={profile["nama_sekolah"] || ""}
                      onChange={(e) => updateField("nama_sekolah", e.target.value)}
                      placeholder="Contoh: Madrasah Aliyah Swasta Al-Ikhlas"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">NPSN</label>
                      <input
                        type="text"
                        value={profile["npsn"] || ""}
                        onChange={(e) => updateField("npsn", e.target.value)}
                        placeholder="20123456"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">NSS / NDS</label>
                      <input
                        type="text"
                        value={profile["nss"] || ""}
                        onChange={(e) => updateField("nss", e.target.value)}
                        placeholder="13123..."
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Jenjang Pendidikan</label>
                    <select
                      value={profile["jenjang"] || ""}
                      onChange={(e) => updateField("jenjang", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 cursor-pointer"
                    >
                      <option value="">— Pilih Jenjang —</option>
                      {["MI", "MTs", "MA", "SD", "SMP", "SMA", "SMK"].map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {activeSection === "alamat" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800">Alamat & Domisili</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Lokasi geografis dan wilayah kerja sekolah</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Alamat Lengkap</label>
                    <textarea
                      rows={2}
                      value={profile["alamat_sekolah"] || ""}
                      onChange={(e) => updateField("alamat_sekolah", e.target.value)}
                      placeholder="Jalan Pendidikan No. 12"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Kelurahan / Desa</label>
                      <input
                        type="text"
                        value={profile["kelurahan"] || ""}
                        onChange={(e) => updateField("kelurahan", e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Kecamatan</label>
                      <input
                        type="text"
                        value={profile["kecamatan"] || ""}
                        onChange={(e) => updateField("kecamatan", e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Kabupaten / Kota</label>
                      <input
                        type="text"
                        value={profile["kabupaten"] || ""}
                        onChange={(e) => updateField("kabupaten", e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Provinsi</label>
                      <input
                        type="text"
                        value={profile["provinsi"] || ""}
                        onChange={(e) => updateField("provinsi", e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Kode Pos</label>
                      <input
                        type="text"
                        value={profile["kode_pos"] || ""}
                        onChange={(e) => updateField("kode_pos", e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "kontak" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800">Kontak & Media Komunikasi</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Kanal komunikasi resmi madrasah</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">No. Telepon Madrasah</label>
                    <input
                      type="text"
                      value={profile["telepon"] || ""}
                      onChange={(e) => updateField("telepon", e.target.value)}
                      placeholder="(021) 1234567"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Email Resmi</label>
                    <input
                      type="email"
                      value={profile["email"] || ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="info@madrasah.sch.id"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Website Resmi</label>
                    <input
                      type="text"
                      value={profile["website"] || ""}
                      onChange={(e) => updateField("website", e.target.value)}
                      placeholder="https://madrasah.sch.id"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                    />
                  </div>
                </div>
              )}

              {activeSection === "pimpinan" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800">Pimpinan Madrasah</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Penandatangan surat resmi dan rapor</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Nama Kepala Madrasah</label>
                    <input
                      type="text"
                      value={profile["kepala_sekolah"] || ""}
                      onChange={(e) => updateField("kepala_sekolah", e.target.value)}
                      placeholder="H. Ahmad Dahlan, M.Pd.I"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">NIP Kepala Madrasah</label>
                    <input
                      type="text"
                      value={profile["nip_kepala_sekolah"] || ""}
                      onChange={(e) => updateField("nip_kepala_sekolah", e.target.value)}
                      placeholder="197501012000031001"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                    />
                  </div>
                </div>
              )}

              {activeSection === "logo" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800">Logo Lembaga</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Logo untuk kop surat resmi dan dokumen rapor</p>
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-blue-600" />
                      Pilih File Logo (Maks. 2MB)
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) return Swal.fire("Terlalu besar", "Ukuran maksimal 2MB", "warning");
                            const r = new FileReader();
                            r.onloadend = () => updateField("school_logo", String(r.result || ""));
                            r.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {profile["school_logo"] && (
                      <div className="mt-3 relative h-20 w-36 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center">
                        <Image
                          src={ensureHttpsUrl(profile["school_logo"])}
                          alt="Logo Madrasah"
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Kolom Kanan: Preview Kop Surat */}
          <div className="lg:col-span-4 space-y-4">
            <Card>
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <h3 className="font-heading font-bold text-sm text-slate-800">Preview Kop Surat Resmi</h3>
              </div>
              <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-2 text-center shadow-2xs">
                {profile["school_logo"] ? (
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <Image
                      src={ensureHttpsUrl(profile["school_logo"])}
                      alt="Logo Sekolah"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-2 text-slate-400">
                    <School className="w-8 h-8" />
                  </div>
                )}
                <p className="font-bold text-sm text-slate-800 leading-snug">{profile["nama_sekolah"] || "Nama Sekolah"}</p>
                {profile["npsn"] && <p className="text-[11px] text-slate-500 font-mono">NPSN: {profile["npsn"]}</p>}
                <p className="text-[11px] text-slate-500 leading-normal">{profile["alamat_sekolah"] || "Alamat Sekolah"}</p>
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
                <div className="border-t-2 border-slate-800 mt-3 pt-0.5"></div>
                <div className="border-t border-slate-400"></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 text-center">
                Format kop surat di atas otomatis diterapkan pada pencetakan arsip surat, slip gaji, dan dokumen raport.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* LeftDrawer Edit Profil Lengkap */}
      <LeftDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Form Edit Profil Sekolah"
        subtitle="Drawer pengisian seluruh data identitas madrasah"
        width="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">Nama Sekolah / Madrasah *</label>
            <input
              type="text"
              value={profile["nama_sekolah"] || ""}
              onChange={(e) => updateField("nama_sekolah", e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">NPSN</label>
              <input
                type="text"
                value={profile["npsn"] || ""}
                onChange={(e) => updateField("npsn", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Jenjang</label>
              <select
                value={profile["jenjang"] || ""}
                onChange={(e) => updateField("jenjang", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 cursor-pointer"
              >
                <option value="">— Pilih —</option>
                {["MI", "MTs", "MA", "SD", "SMP", "SMA", "SMK"].map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">Alamat Jalan</label>
            <textarea
              rows={2}
              value={profile["alamat_sekolah"] || ""}
              onChange={(e) => updateField("alamat_sekolah", e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Kecamatan</label>
              <input
                type="text"
                value={profile["kecamatan"] || ""}
                onChange={(e) => updateField("kecamatan", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Kabupaten / Kota</label>
              <input
                type="text"
                value={profile["kabupaten"] || ""}
                onChange={(e) => updateField("kabupaten", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">No. Telepon</label>
              <input
                type="text"
                value={profile["telepon"] || ""}
                onChange={(e) => updateField("telepon", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Email</label>
              <input
                type="email"
                value={profile["email"] || ""}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Kepala Madrasah</label>
              <input
                type="text"
                value={profile["kepala_sekolah"] || ""}
                onChange={(e) => updateField("kepala_sekolah", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">NIP Kepala</label>
              <input
                type="text"
                value={profile["nip_kepala_sekolah"] || ""}
                onChange={(e) => updateField("nip_kepala_sekolah", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </LeftDrawer>
    </div>
  );
}