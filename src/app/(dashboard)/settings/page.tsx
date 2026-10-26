"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import LeftDrawer from "@/components/ui/LeftDrawer";
import { Settings, UserPlus, Save, CheckCircle2, Trash2, Building2, Users, Wrench, Shield, KeyRound, Loader2 } from "lucide-react";
import { ensureHttpsUrl } from "@/lib/url";

interface UserItem {
  id: number;
  name: string;
  username: string;
  role: string;
  status: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

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
          logo: ensureHttpsUrl(data.logo || ""),
          address: data.address || "",
          headmaster_name: data.headmaster_name || "",
          headmaster_nip: data.headmaster_nip || ""
        });
      }
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
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
    } catch {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    }
  };

  // User LeftDrawer states
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [userDrawerMode, setUserDrawerMode] = useState<"add" | "edit">("add");
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    username: "",
    role: "operator",
    status: "aktif",
    password: "",
  });
  const [userFormLoading, setUserFormLoading] = useState(false);

  const handleOpenAddUser = () => {
    setUserDrawerMode("add");
    setEditingUser(null);
    setUserFormData({
      name: "",
      username: "",
      role: "operator",
      status: "aktif",
      password: "",
    });
    setUserDrawerOpen(true);
  };

  const handleOpenEditUser = (user: UserItem) => {
    setUserDrawerMode("edit");
    setEditingUser(user);
    setUserFormData({
      name: user.name || "",
      username: user.username || "",
      role: user.role || "operator",
      status: user.status || "aktif",
      password: "",
    });
    setUserDrawerOpen(true);
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.username.trim()) {
      Swal.fire("Perhatian", "Nama dan Username wajib diisi", "warning");
      return;
    }
    if (userDrawerMode === "add" && !userFormData.password) {
      Swal.fire("Perhatian", "Password wajib diisi untuk akun baru", "warning");
      return;
    }

    setUserFormLoading(true);
    try {
      const url = userDrawerMode === "edit" ? `/api/users/${editingUser?.id}` : "/api/users";
      const method = userDrawerMode === "edit" ? "PUT" : "POST";
      const payload: Record<string, string> = {
        name: userFormData.name.trim(),
        username: userFormData.username.trim(),
        role: userFormData.role,
        status: userFormData.status,
      };
      if (userFormData.password) {
        payload.password = userFormData.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        Swal.fire({
          title: "Berhasil",
          text: userDrawerMode === "edit" ? "Data pengguna berhasil diperbarui" : "Pengguna baru berhasil ditambahkan",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        setUserDrawerOpen(false);
        loadUsers();
      } else {
        Swal.fire("Gagal", json.error || json.message || "Terjadi kesalahan", "error");
      }
    } catch {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    } finally {
      setUserFormLoading(false);
    }
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
        } catch {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const deleteUser = async (userId: number, userName: string) => {
    const r = await Swal.fire({
      title: 'Hapus Pengguna?',
      text: `Pengguna "${userName}" akan dinonaktifkan / dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (r.isConfirmed) {
      try {
        const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        const json = await res.json();
        if (res.ok && json.success) {
          Swal.fire('Berhasil', json.message || 'Pengguna berhasil dihapus', 'success');
          loadUsers();
        } else {
          Swal.fire('Gagal', json.error || 'Gagal menghapus pengguna', 'error');
        }
      } catch {
        Swal.fire('Error', 'Gagal menghubungi server', 'error');
      }
    }
  };

  const handleBulkDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
    const r = await Swal.fire({
      title: `Hapus ${selectedUserIds.length} pengguna terpilih?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus Masal',
      cancelButtonText: 'Batal'
    });
    if (r.isConfirmed) {
      try {
        await Promise.all(selectedUserIds.map(id => fetch(`/api/users/${id}`, { method: 'DELETE' })));
        Swal.fire('Berhasil', `${selectedUserIds.length} pengguna berhasil dihapus`, 'success');
        setSelectedUserIds([]);
        loadUsers();
      } catch {
        Swal.fire('Error', 'Gagal menghapus sebagian pengguna', 'error');
      }
    }
  };

  const wipeAllData = async () => {
    // Langkah 1: Peringatan awal
    const step1 = await Swal.fire({
      title: 'ZONA BAHAYA',
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
      title: 'Backup Data Wajib',
      html: `<div style="text-align:left">
        <p style="font-size:0.875rem;color:#475569;">Sebelum menghapus data, Anda <strong style="color:#dc2626;">WAJIB</strong> mengunduh backup terlebih dahulu.</p>
        <p style="font-size:0.8125rem;color:#94a3b8;margin-top:8px;">Klik tombol di bawah untuk mengunduh file backup, lalu lanjutkan.</p>
      </div>`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#0ea5e9',
      confirmButtonText: 'Download Backup Sekarang',
      cancelButtonText: 'Batal Proses',
    });
    if (!step2.isConfirmed) return;

    // Trigger download backup
    window.location.href = '/api/settings/backup';

    // Tunggu sebentar sebelum lanjut ke langkah 3
    await new Promise(r => setTimeout(r, 2000));

    // Langkah 3: Konfirmasi akhir dengan ketik HAPUS SEMUA
    const step3 = await Swal.fire({
      title: 'Konfirmasi Akhir',
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
    } catch {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    }
  };

  const handleRestore = async () => {
    const { value: file } = await Swal.fire({
      title: 'Restore Data dari Backup',
      html: `<div style="text-align:left">
        <p style="font-size:0.875rem;color:#475569;">Pilih file backup SQL yang ingin di-restore.</p>
        <p style="font-size:0.75rem;color:#94a3b8;margin-top:6px;">Data saat ini akan <strong>digantikan</strong> sepenuhnya oleh data dari backup.</p>
      </div>`,
      input: 'file',
      inputAttributes: { accept: '.sql', 'aria-label': 'Upload file backup SQL' },
      showCancelButton: true,
      confirmButtonColor: '#059669',
      confirmButtonText: 'Restore Data',
      cancelButtonText: 'Batal',
    });
    if (!file) return;

    // Baca file SQL sebagai text
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const sqlContent = e.target?.result as string;

        // Validasi format
        if (!sqlContent.includes('INSERT INTO')) {
          Swal.fire('Format Salah', 'File bukan backup SQL yang valid. Pastikan menggunakan file .sql dari fitur Backup.', 'error');
          return;
        }

        // Ambil tanggal backup dari header
        let backupDate = 'Tidak diketahui';
        const dateMatch = sqlContent.match(/-- DATABASE BACKUP — (.+)/);
        if (dateMatch) backupDate = dateMatch[1].trim();

        // Hitung jumlah INSERT statements
        const insertCount = (sqlContent.match(/INSERT INTO/g) || []).length;

        // Konfirmasi restore
        const confirm = await Swal.fire({
          title: 'Konfirmasi Restore',
          html: `<div style="text-align:left">
            <p style="font-size:0.875rem;color:#475569;">File backup dari:</p>
            <p style="font-size:0.8125rem;font-weight:700;color:#1e293b;margin-top:4px;">${backupDate}</p>
            <p style="font-size:0.75rem;color:#64748b;margin-top:4px;">${insertCount} data akan di-restore</p>
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
          headers: { 'Content-Type': 'text/plain' },
          body: sqlContent,
        });
        const json = await res.json();
        Swal.close();

        if (res.ok && json.success) {
          const list = (json.restored || []).join(', ');
          Swal.fire({
            title: 'Restore Berhasil!',
            html: `<div style="text-align:left"><p style="font-size:0.875rem;color:#475569;">Data berhasil di-restore:</p><p style="font-size:0.8125rem;color:#1e293b;margin-top:6px;">${list || 'Semua data'}</p></div>`,
            icon: 'success'
          });
        } else {
          Swal.fire('Gagal', json.error || 'Terjadi kesalahan saat restore', 'error');
        }
      } catch {
        Swal.fire('Error', 'File SQL tidak valid atau corrupt.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const settingsTabs = [
    { id: "profil", label: "Profil Madrasah", desc: "Identitas, logo, kontak & pimpinan", icon: Building2 },
    { id: "users", label: "Manajemen User", desc: "Kelola akun & privilege akses", icon: Users },
    { id: "tools", label: "Alat Lanjut & DB", desc: "Pencadangan, restore & reset", icon: Wrench },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Pengaturan Sistem"
        subtitle="Konfigurasi profil madrasah dan manajemen akses pengguna"
        icon={<Settings />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Panel Sisi Kiri: Navigasi Pengaturan */}
        <div className="lg:col-span-3 space-y-2 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Menu Pengaturan
          </div>
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                  isActive
                    ? "bg-blue-50 border border-blue-200 text-blue-700 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">{tab.label}</span>
                  <span className="text-[11px] text-slate-400 font-normal leading-tight block mt-0.5">{tab.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Konten Tab Aktif */}
        <div className="lg:col-span-9 space-y-6">
          {/* Tab 1: Profil */}
          {activeTab === 'profil' && (
        <Card noPadding>
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <h4 className="font-heading font-bold text-sm text-slate-800 m-0">Identitas Utama Madrasah</h4>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-start gap-6 border border-slate-200 p-5 rounded-2xl bg-slate-50/50">
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden relative">
                  {profile.logo ? (
                    <Image 
                      src={ensureHttpsUrl(profile.logo)} 
                      alt="Logo Madrasah" 
                      fill
                      className="object-contain" 
                    />
                  ) : (
                    <span className="text-slate-400 text-xs font-bold text-center px-2">Belum ada logo</span>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Logo Madrasah (Sidebar)</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer shadow-sm transition-colors text-sm font-semibold text-slate-700">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500 ring-offset-2 transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Telepon / WhatsApp</label>
              <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500 ring-offset-2 transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Official</label>
              <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500 ring-offset-2 transition-all shadow-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alamat Lengkap</label>
              <textarea rows={3} value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500 ring-offset-2 transition-all shadow-sm resize-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kepala Madrasah</label>
              <input type="text" value={profile.headmaster_name} onChange={(e) => setProfile({...profile, headmaster_name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500 ring-offset-2 transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">NIP Kepala Madrasah</label>
              <input type="text" value={profile.headmaster_nip} onChange={(e) => setProfile({...profile, headmaster_nip: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500 ring-offset-2 transition-all shadow-sm" />
            </div>
          </div>
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button onClick={saveProfile} className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-sm hover:shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </button>
          </div>
        </Card>
      )}

      {/* Tab 2: Manajemen User */}
      {activeTab === 'users' && (
        <Card noPadding>
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <h4 className="font-heading font-bold text-sm text-slate-800 m-0">Akses & Manajemen Pengguna</h4>
            </div>
            <button onClick={handleOpenAddUser} className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Tambah Akun
            </button>
          </div>
          {selectedUserIds.length > 0 && (
            <div className="m-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{selectedUserIds.length} pengguna dipilih</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleBulkDeleteUsers}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Terpilih
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserIds([])}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b-2 border-slate-200">
                  <th className="py-4 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={users.length > 0 && selectedUserIds.length === users.length}
                      onChange={(e) => setSelectedUserIds(e.target.checked ? users.map((u: UserItem) => u.id) : [])}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      aria-label="Pilih semua pengguna"
                    />
                  </th>
                  <th className="p-4 text-xs tracking-wider text-slate-500 font-bold uppercase text-center w-12">No</th>
                  <th className="p-4 text-xs tracking-wider text-slate-500 font-bold uppercase text-left">Detail Pengguna</th>
                  <th className="p-4 text-xs tracking-wider text-slate-500 font-bold uppercase text-left">Privilege</th>
                  <th className="p-4 text-xs tracking-wider text-slate-500 font-bold uppercase text-center">Status</th>
                  <th className="p-4 text-xs tracking-wider text-slate-500 font-bold uppercase text-center">Kontrol</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-10 text-center text-slate-400 text-sm">Memuat data pengguna...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-slate-400 text-sm">Belum ada akun pengguna.</td></tr>
                ) : (
                  users.map((u, i: number) => {
                    const isSelected = selectedUserIds.includes(u.id);
                    return (
                    <tr key={u.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}>
                      <td className="py-4 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedUserIds(prev => [...prev, u.id]);
                            else setSelectedUserIds(prev => prev.filter(id => id !== u.id));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          aria-label={`Pilih ${u.name}`}
                        />
                      </td>
                      <td className="p-4 text-center text-xs font-mono font-medium text-slate-400">{i + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 border border-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {(u.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800 m-0">{u.name}</p>
                            <p className="text-xs text-slate-500 m-0">@ {u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wide">
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
                          <button onClick={() => handleOpenEditUser(u)} className="inline-flex px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
                            Edit
                          </button>
                          <button onClick={() => resetPassword(u.id, u.username)} className="inline-flex px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors">
                            Reset Pass
                          </button>
                          <button onClick={() => deleteUser(u.id, u.name)} className="inline-flex px-2 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors" title="Hapus Akun">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Alat Lanjut */}
      {activeTab === 'tools' && (
        <Card className="p-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Backup */}
             <div className="text-center border border-sky-200 bg-sky-50 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-sky-700 mb-1.5">Pencadangan Data</h3>
                  <p className="text-sm text-slate-600 mb-5">Unduh seluruh data sistem sebagai file backup SQL. Disarankan dilakukan secara berkala.</p>
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
                  <p className="text-sm text-slate-600 mb-5">Pulihkan data dari file backup SQL. Data saat ini akan digantikan oleh data dari backup.</p>
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
        </Card>
      )}
        </div>
      </div>

      {/* LeftDrawer Form Tambah / Edit Pengguna */}
      <LeftDrawer
        isOpen={userDrawerOpen}
        onClose={() => setUserDrawerOpen(false)}
        title={userDrawerMode === "add" ? "Tambah Akun Pengguna" : "Edit Akun Pengguna"}
        subtitle={userDrawerMode === "add" ? "Buat kredensial login dan hak akses user baru" : `Perbarui data akun @${editingUser?.username || ""}`}
        width="max-w-md"
      >
        <form onSubmit={handleUserFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={userFormData.name}
              onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Ahmad Dahlan, S.Pd."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username / Akun Login <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={userFormData.username}
              onChange={(e) => setUserFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Contoh: ahmad_operator"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hak Akses (Role) <span className="text-rose-500">*</span>
              </label>
              <select
                value={userFormData.role}
                onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 cursor-pointer"
              >
                <option value="admin">Admin / Pimpinan</option>
                <option value="operator">Operator Madrasah</option>
                <option value="bendahara">Bendahara</option>
                <option value="guru">Guru Pengajar</option>
                <option value="staf">Staf TU</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Akun
              </label>
              <select
                value={userFormData.status}
                onChange={(e) => setUserFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 cursor-pointer"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password {userDrawerMode === "add" ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal lowercase">(kosongkan jika tidak diubah)</span>}
            </label>
            <input
              type="password"
              value={userFormData.password}
              onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder={userDrawerMode === "add" ? "Minimal 6 karakter" : "Ketik untuk ganti password"}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setUserDrawerOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={userFormLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60"
            >
              {userFormLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {userDrawerMode === "add" ? "Simpan Pengguna" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </LeftDrawer>

    </div>
  );
}
