"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    logo: "",
    address: "",
    headmaster_name: "",
    headmaster_nip: ""
  });

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/settings/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          logo: data.logo || "",
          address: data.address || "",
          headmaster_name: data.headmaster_name || "",
          headmaster_nip: data.headmaster_nip || ""
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Gagal", "Ukuran file logo maksimal 2MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        console.log("USERS FETCHED:", data);
        if (data.length === 0) {
          console.warn("API RETURNED EMPTY LIST");
        }
        setUsers(data || []);
      } else {
        const errData = await res.json();
        Swal.fire("Gagal", errData.message || "Gagal memuat data pengguna", "error");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const saveProfile = async () => {
    Swal.fire({ title: "Menyimpan...", didOpen: () => Swal.showLoading() });
    try {
      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      Swal.close();
      if (res.ok && data.success) {
        Swal.fire("Berhasil", "Profil madrasah diperbarui.", "success");
      } else {
        Swal.fire("Gagal", data.error || "Gagal memperbarui profil", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    }
  };

  const addUser = () => {
    Swal.fire({
      title: 'Tambah Akun',
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <label style="font-size:0.75rem;font-weight:600;">Nama</label>
          <input id="swal-u-name" class="swal2-input focus:ring-2 ring-indigo-500 border-slate-300 rounded" style="margin:0;">
          <label style="font-size:0.75rem;font-weight:600;">Username (Email)</label>
          <input id="swal-u-user" class="swal2-input focus:ring-2 ring-indigo-500 border-slate-300 rounded" style="margin:0;">
          <label style="font-size:0.75rem;font-weight:600;">Password</label>
          <input id="swal-u-pass" type="password" class="swal2-input focus:ring-2 ring-indigo-500 border-slate-300 rounded" style="margin:0;">
          <label style="font-size:0.75rem;font-weight:600;">Role</label>
          <select id="swal-u-role" class="swal2-select focus:ring-2 ring-indigo-500 border-slate-300 rounded" style="margin:0;">
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="kepsek">Kepsek</option>
            <option value="bendahara">Bendahara</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#4f46e5',
      preConfirm: () => {
        return {
          name: (document.getElementById('swal-u-name') as HTMLInputElement).value,
          username: (document.getElementById('swal-u-user') as HTMLInputElement).value,
          password: (document.getElementById('swal-u-pass') as HTMLInputElement).value,
          role: (document.getElementById('swal-u-role') as HTMLSelectElement).value
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: "Memproses...", didOpen: () => Swal.showLoading() });
        try {
          const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.value)
          });
          const json = await res.json();
          Swal.close();
          if (res.ok && json.success) {
            Swal.fire('Berhasil', 'Akun baru ditambahkan.', 'success');
            loadUsers();
          } else {
            Swal.fire('Gagal', json.error || 'Terjadi kesalahan', 'error');
          }
        } catch (e) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const editUser = async (user: any) => {
    Swal.fire({
      title: 'Edit Pengguna',
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <label style="font-size:0.75rem;font-weight:600;">Nama</label>
          <input id="swal-e-name" class="swal2-input" value="${user.name || ''}" style="margin:0;">
          <label style="font-size:0.75rem;font-weight:600;">Username (Email)</label>
          <input id="swal-e-user" class="swal2-input" value="${user.username || ''}" style="margin:0;">
          <label style="font-size:0.75rem;font-weight:600;">Role</label>
          <select id="swal-e-role" class="swal2-select" style="margin:0;">
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
            <option value="operator" ${user.role === 'operator' ? 'selected' : ''}>Operator</option>
            <option value="kepsek" ${user.role === 'kepsek' ? 'selected' : ''}>Kepsek</option>
            <option value="bendahara" ${user.role === 'bendahara' ? 'selected' : ''}>Bendahara</option>
          </select>
          <label style="font-size:0.75rem;font-weight:600;">Status</label>
          <select id="swal-e-stat" class="swal2-select" style="margin:0;">
            <option value="aktif" ${user.status === 'aktif' ? 'selected' : ''}>Aktif</option>
            <option value="nonaktif" ${user.status === 'nonaktif' ? 'selected' : ''}>Nonaktif</option>
          </select>
          <label style="font-size:0.75rem;font-weight:600;">Password Baru <span style="color:#94a3b8;">(kosongkan jika tak diubah)</span></label>
          <input id="swal-e-pass" type="password" class="swal2-input" placeholder="••••••" style="margin:0;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#4f46e5',
      preConfirm: () => {
        return {
          name: (document.getElementById('swal-e-name') as HTMLInputElement).value,
          username: (document.getElementById('swal-e-user') as HTMLInputElement).value,
          role: (document.getElementById('swal-e-role') as HTMLSelectElement).value,
          status: (document.getElementById('swal-e-stat') as HTMLSelectElement).value,
          password: (document.getElementById('swal-e-pass') as HTMLInputElement).value,
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: "Memproses...", didOpen: () => Swal.showLoading() });
        try {
          const res = await fetch(`/api/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.value)
          });
          const json = await res.json();
          Swal.close();
          if (res.ok && json.success) {
            Swal.fire({ icon: "success", title: "Berhasil", text: "Data user diperbarui.", toast: true, position: "top-end", timer: 3000, showConfirmButton: false });
            loadUsers();
          } else {
            Swal.fire('Gagal', json.error || 'Terjadi kesalahan', 'error');
          }
        } catch (e) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const resetPassword = (userId: number, userName: string) => {
    Swal.fire({
      title: 'Reset Password?',
      html: `<p style="font-size:0.875rem;color:#475569;">Password user <strong>"${userName}"</strong> akan di-reset.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d97706',
      confirmButtonText: 'Ya, Reset',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: "Memproses...", didOpen: () => Swal.showLoading() });
        try {
          const res = await fetch(`/api/users/${userId}/reset-password`, { method: "POST" });
          const json = await res.json();
          Swal.close();
          if (res.ok && json.success) {
            Swal.fire('Berhasil', `Password direset. Password baru: <strong>${json.new_password}</strong>`, 'success');
          } else {
            Swal.fire('Gagal', json.error || 'Terjadi kesalahan', 'error');
          }
        } catch (e) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const wipeAllData = async () => {
    // Langkah 1: Peringatan awal
    const step1 = await Swal.fire({
      title: '⚠️ ZONA BAHAYA',
      html: `<div style="text-align:left">
        <p style="font-size:0.875rem;color:#dc2626;font-weight:700;">Anda akan menghapus SEMUA data dalam sistem.</p>
        <ul style="font-size:0.8125rem;color:#475569;margin-top:8px;padding-left:1.5rem;list-style:disc;">
          <li>Semua data siswa, pegawai, transaksi, dll akan hilang</li>
          <li>Aksi ini <strong>TIDAK BISA</strong> dibatalkan</li>
          <li>Anda <strong>WAJIB</strong> backup data terlebih dahulu</li>
        </ul>
      </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d97706',
      confirmButtonText: 'Lanjutkan ke Backup',
      cancelButtonText: 'Batal',
    });
    if (!step1.isConfirmed) return;

    // Langkah 2: Wajib backup dulu
    const step2 = await Swal.fire({
      title: '📦 Backup Data Wajib',
      html: `<div style="text-align:left">
        <p style="font-size:0.875rem;color:#475569;">Sebelum menghapus data, Anda <strong style="color:#dc2626;">WAJIB</strong> mengunduh backup terlebih dahulu.</p>
        <p style="font-size:0.8125rem;color:#94a3b8;margin-top:8px;">Klik tombol di bawah untuk mengunduh file backup, lalu lanjutkan.</p>
      </div>`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#0ea5e9',
      confirmButtonText: '⬇ Download Backup Sekarang',
      cancelButtonText: 'Batal Proses',
    });
    if (!step2.isConfirmed) return;

    // Trigger download backup
    window.location.href = '/api/settings/backup';

    // Tunggu sebentar sebelum lanjut ke langkah 3
    await new Promise(r => setTimeout(r, 2000));

    // Langkah 3: Konfirmasi akhir dengan ketik HAPUS SEMUA
    const step3 = await Swal.fire({
      title: '🔴 Konfirmasi Akhir',
      html: `<div style="text-align:left">
        <p style="font-size:0.875rem;color:#dc2626;font-weight:700;">Pastikan file backup sudah terdownload!</p>
        <p style="font-size:0.8125rem;color:#475569;margin-top:8px;">Ketik <strong>HAPUS SEMUA</strong> untuk konfirmasi penghapusan seluruh data.</p>
      </div>`,
      icon: 'warning',
      input: 'text',
      inputPlaceholder: 'Ketik HAPUS SEMUA',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Hapus Semua Data',
      cancelButtonText: 'Batal',
      preConfirm: (value) => {
        if (value !== 'HAPUS SEMUA') {
          Swal.showValidationMessage('Ketik "HAPUS SEMUA" untuk konfirmasi.');
          return false;
        }
        return true;
      }
    });
    if (!step3.isConfirmed) return;

    // Eksekusi wipe
    Swal.fire({ title: "Menghapus...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await fetch('/api/settings/wipe', { method: "POST" });
      const json = await res.json();
      Swal.close();
      if (res.ok && json.success) {
        Swal.fire('Selesai', 'Semua data telah dihapus. Backup Anda aman.', 'success');
      } else {
        Swal.fire('Gagal', json.error || 'Terjadi kesalahan', 'error');
      }
    } catch (e) {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    }
  };

  const handleRestore = async () => {
    const { value: file } = await Swal.fire({
      title: '📥 Restore Data dari Backup',
      html: `<div style="text-align:left">
        <p style="font-size:0.875rem;color:#475569;">Pilih file backup JSON yang ingin di-restore.</p>
        <p style="font-size:0.75rem;color:#94a3b8;margin-top:6px;">⚠️ Data saat ini akan <strong>digantikan</strong> sepenuhnya oleh data dari backup.</p>
      </div>`,
      input: 'file',
      inputAttributes: { accept: '.json', 'aria-label': 'Upload file backup JSON' },
      showCancelButton: true,
      confirmButtonColor: '#059669',
      confirmButtonText: 'Restore Data',
      cancelButtonText: 'Batal',
    });
    if (!file) return;

    // Baca file
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);

        // Validasi format
        if (!backup.meta || !backup.data) {
          Swal.fire('Format Salah', 'File bukan backup yang valid. Pastikan menggunakan file dari fitur Backup.', 'error');
          return;
        }

        // Konfirmasi restore
        const confirm = await Swal.fire({
          title: 'Konfirmasi Restore',
          html: `<div style="text-align:left">
            <p style="font-size:0.875rem;color:#475569;">File backup dari:</p>
            <p style="font-size:0.8125rem;font-weight:700;color:#1e293b;margin-top:4px;">${new Date(backup.meta.exportedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p style="font-size:0.75rem;color:#dc2626;margin-top:8px;font-weight:600;">Data saat ini akan dihapus dan digantikan oleh data dari backup ini.</p>
          </div>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#059669',
          confirmButtonText: 'Ya, Restore Sekarang',
          cancelButtonText: 'Batal',
        });
        if (!confirm.isConfirmed) return;

        Swal.fire({ title: 'Restoring data...', html: 'Proses ini bisa memakan waktu beberapa menit.', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const res = await fetch('/api/settings/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backup),
        });
        const json = await res.json();
        Swal.close();

        if (res.ok && json.success) {
          const list = (json.restored || []).join(', ');
          Swal.fire({
            title: '✅ Restore Berhasil!',
            html: `<div style="text-align:left"><p style="font-size:0.875rem;color:#475569;">Data berhasil di-restore:</p><p style="font-size:0.8125rem;color:#1e293b;margin-top:6px;">${list || 'Semua data'}</p></div>`,
            icon: 'success'
          });
        } else {
          Swal.fire('Gagal', json.error || 'Terjadi kesalahan saat restore', 'error');
        }
      } catch (err) {
        Swal.fire('Error', 'File JSON tidak valid atau corrupt.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-400 rounded-2xl overflow-hidden relative shadow-lg">
        <div className="absolute -right-5 -top-5 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute right-20 -bottom-10 w-36 h-36 bg-white/5 rounded-full blur-xl"></div>
        
        <div className="p-8 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-heading font-bold text-2xl text-white m-0">Pengaturan Sistem</h2>
                <p className="text-sm text-white/80 mt-1">Konfigurasi profil madrasah dan manajemen akses pengguna.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('profil')} 
                className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  activeTab === 'profil' 
                    ? 'bg-white/35 text-white border-white/50 shadow-sm' 
                    : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                }`}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                Profil
              </button>
              <button 
                onClick={() => setActiveTab('users')} 
                className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  activeTab === 'users' 
                    ? 'bg-white/35 text-white border-white/50 shadow-sm' 
                    : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                }`}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                Manajemen User
              </button>
              <button 
                onClick={() => setActiveTab('tools')} 
                className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  activeTab === 'tools' 
                    ? 'bg-white/35 text-white border-white/50 shadow-sm' 
                    : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                }`}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
                Alat Lanjut
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 1: Profil */}
      {activeTab === 'profil' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in-up">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
            <h4 className="font-heading font-bold text-sm text-slate-800 m-0">Identitas Utama Madrasah</h4>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-start gap-6 border border-slate-200 p-5 rounded-2xl bg-slate-50/50">
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden relative">
                  {profile.logo ? (
                    <img src={profile.logo} alt="Logo Madrasah" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-slate-400 text-xs font-bold text-center px-2">Belum ada logo</span>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Logo Madrasah (Sidebar)</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer shadow-sm transition-colors text-sm font-semibold text-slate-700">
                    <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Pilih Gambar
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {profile.logo && (
                    <button onClick={() => setProfile({...profile, logo: ""})} className="px-3 py-2 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors text-sm font-semibold border border-rose-100">
                      Hapus
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400 font-medium">Format JPG/PNG transparan max 2MB. Logo akan ditampilkan di navigasi sidebar.</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap Madrasah <span className="text-rose-500">*</span></label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 ring-offset-2 transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Telepon / WhatsApp</label>
              <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 ring-offset-2 transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Official</label>
              <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 ring-offset-2 transition-all shadow-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alamat Lengkap</label>
              <textarea rows={3} value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 ring-offset-2 transition-all shadow-sm resize-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kepala Madrasah</label>
              <input type="text" value={profile.headmaster_name} onChange={(e) => setProfile({...profile, headmaster_name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 ring-offset-2 transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">NIP Kepala Madrasah</label>
              <input type="text" value={profile.headmaster_nip} onChange={(e) => setProfile({...profile, headmaster_nip: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500 ring-offset-2 transition-all shadow-sm" />
            </div>
          </div>
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button onClick={saveProfile} className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-[0_4px_12px_rgba(99,102,241,0.2)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              Simpan Perubahan Profil
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Manajemen User */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in-up">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
              <h4 className="font-heading font-bold text-sm text-slate-800 m-0">Akses & Manajemen Pengguna</h4>
            </div>
            <button onClick={addUser} className="inline-flex items-center px-5 py-2 text-xs font-bold text-white uppercase tracking-wider bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors shadow-sm">
              + Tambah Akun
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b-2 border-slate-200">
                  <th className="p-4 text-xs tracking-wider text-slate-500 font-bold uppercase text-left">Detail Pengguna</th>
                  <th className="p-4 text-xs tracking-wider text-slate-500 font-bold uppercase text-left">Privilege</th>
                  <th className="p-4 text-xs tracking-wider text-slate-500 font-bold uppercase text-center">Status</th>
                  <th className="p-4 text-xs tracking-wider text-slate-500 font-bold uppercase text-center">Kontrol</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-10 text-center text-slate-400 text-sm">Memuat data pengguna...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-slate-400 text-sm">Belum ada akun pengguna.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {(u.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800 m-0">{u.name}</p>
                            <p className="text-xs text-slate-500 m-0">@ {u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="inline-flex px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wide">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-center">
                        {u.status === 'aktif' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="p-4 align-middle text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => editUser(u)} className="inline-flex px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors">
                            Edit
                          </button>
                          <button onClick={() => resetPassword(u.id, u.username)} className="inline-flex px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors">
                            Reset Pass
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Alat Lanjut */}
      {activeTab === 'tools' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-8 animate-fade-in-up">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Backup */}
             <div className="text-center border border-sky-200 bg-sky-50 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-sky-700 mb-1.5">Pencadangan Data</h3>
                  <p className="text-sm text-slate-600 mb-5">Unduh seluruh data sistem sebagai file backup JSON. Disarankan dilakukan secara berkala.</p>
                </div>
                <div>
                  <button onClick={() => window.location.href = "/api/settings/backup"} className="w-full justify-center px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 text-sm">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    DOWNLOAD BACKUP
                  </button>
                </div>
             </div>

             {/* Restore */}
             <div className="text-center border border-emerald-200 bg-emerald-50 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-emerald-700 mb-1.5">Restore Data</h3>
                  <p className="text-sm text-slate-600 mb-5">Pulihkan data dari file backup JSON. Data saat ini akan digantikan oleh data dari backup.</p>
                </div>
                <div>
                  <button onClick={handleRestore} className="w-full justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 text-sm">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0L16 8m4-4v12" /></svg>
                    UPLOAD & RESTORE
                  </button>
                </div>
             </div>

             {/* Wipe */}
             <div className="text-center border border-rose-200 bg-rose-50 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-rose-700 mb-1.5">Zona Bahaya</h3>
                  <p className="text-sm text-slate-600 mb-5">Hapus seluruh data sistem. Backup wajib diunduh terlebih dahulu sebagai syarat.</p>
                </div>
                <div>
                  <button onClick={wipeAllData} className="w-full justify-center px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-200 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 text-sm">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    WIPE OUT (RESET)
                  </button>
                </div>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
