"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import { User } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    role: ""
  });

  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/profile/me");
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || "",
          username: data.username || "",
          role: data.role || ""
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    if (!profile.name || !profile.username) {
      Swal.fire("Peringatan", "Nama dan username wajib diisi.", "warning");
      return;
    }

    Swal.fire({ title: "Menyimpan...", didOpen: () => Swal.showLoading() });
    try {
      const res = await fetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      Swal.close();
      if (res.ok && data.success) {
        Swal.fire({ icon: "success", title: "Berhasil", text: "Profil berhasil diperbarui.", toast: true, position: "top-end", timer: 3000, showConfirmButton: false });
      } else {
        Swal.fire("Gagal", data.error || "Gagal memperbarui profil", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    }
  };

  const changePassword = async () => {
    const { current_password, new_password, confirm_password } = password;

    if (!current_password || !new_password || !confirm_password) {
      Swal.fire("Peringatan", "Semua field password wajib diisi.", "warning");
      return;
    }
    if (new_password.length < 6) {
      Swal.fire("Peringatan", "Password baru minimal 6 karakter.", "warning");
      return;
    }
    if (new_password !== confirm_password) {
      Swal.fire("Peringatan", "Konfirmasi password tidak cocok.", "warning");
      return;
    }

    Swal.fire({ title: "Mengubah password...", didOpen: () => Swal.showLoading() });
    try {
      const res = await fetch("/api/profile/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password, new_password })
      });
      const data = await res.json();
      Swal.close();
      if (res.ok && data.success) {
        Swal.fire({ icon: "success", title: "Berhasil", text: "Password berhasil diubah.", toast: true, position: "top-end", timer: 3000, showConfirmButton: false });
        setPassword({ current_password: "", new_password: "", confirm_password: "" });
      } else {
        Swal.fire("Gagal", data.error || "Password lama salah atau terjadi kesalahan.", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Pengguna"
        subtitle="Kelola informasi akun dan keamanan Anda"
        icon={<User className="w-5 h-5 text-indigo-600" />}
      />

      {/* Grid Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Informasi Profil */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-fit">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
              {(profile.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-800 m-0">Informasi Profil</h3>
              <p className="text-xs text-slate-500 mt-0.5 m-0">Perbarui nama dan identitas akun Anda.</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                value={profile.name} 
                onChange={(e) => setProfile({...profile, name: e.target.value})} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 ring-offset-1 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username (Email) <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                value={profile.username} 
                onChange={(e) => setProfile({...profile, username: e.target.value})} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 ring-offset-1 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role / Hak Akses</label>
              <input 
                type="text" 
                disabled 
                value={profile.role}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 text-slate-400 font-semibold uppercase tracking-wide cursor-not-allowed"
              />
            </div>
            <div className="pt-2">
              <button 
                onClick={saveProfile} 
                className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                Simpan Profil
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Ganti Password */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-fit">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-50 border border-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-800 m-0">Ubah Kata Sandi</h3>
              <p className="text-xs text-slate-500 mt-0.5 m-0">Pastikan akun Anda menggunakan kata sandi yang kuat.</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password Saat Ini <span className="text-rose-500">*</span></label>
              <input 
                type="password" 
                placeholder="Masukkan password lama"
                value={password.current_password}
                onChange={(e) => setPassword({...password, current_password: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-amber-500 ring-offset-1 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password Baru <span className="text-rose-500">*</span></label>
              <input 
                type="password" 
                placeholder="Min. 6 karakter"
                value={password.new_password}
                onChange={(e) => setPassword({...password, new_password: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-amber-500 ring-offset-1 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Konfirmasi Password Baru <span className="text-rose-500">*</span></label>
              <input 
                type="password" 
                placeholder="Ulangi password baru"
                value={password.confirm_password}
                onChange={(e) => setPassword({...password, confirm_password: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-amber-500 ring-offset-1 transition-all shadow-sm"
              />
            </div>
            <div className="pt-2">
              <button 
                onClick={changePassword} 
                className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Ubah Password
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
