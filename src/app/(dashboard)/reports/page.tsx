"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ExportButtons, type ExportOptions, fmtRupiah } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("infaq");
  
  // Data State
  const [infaqData, setInfaqData] = useState<any[]>([]);
  const [pendaftaranData, setPendaftaranData] = useState<any[]>([]);
  const [tabunganData, setTabunganData] = useState<any[]>([]);
  const [aruskasData, setAruskasData] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const loadData = async (tab: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${tab}`);
      const json = await res.json();
      const d = json.data || json;
      
      if (tab === "infaq") setInfaqData(Array.isArray(d) ? d : []);
      if (tab === "pendaftaran") setPendaftaranData(Array.isArray(d) ? d : []);
      if (tab === "tabungan") setTabunganData(Array.isArray(d) ? d : []);
      if (tab === "aruskas") setAruskasData(d || null);

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat data laporan", "error");
    } finally {
      setLoading(false);
    }
  };

  const fmtRp = (n: number) => {
    return "Rp " + Number(n || 0).toLocaleString("id-ID");
  };

  // ===== EXPORT OPTIONS =====

  const getInfaqExportOptions = (): ExportOptions => {
    let totalTagihan = 0, totalBayar = 0, totalTunggak = 0;
    infaqData.forEach(d => {
      totalTagihan += Number(d.amount || 0);
      totalBayar += Number(d.paid || 0);
      totalTunggak += Number(d.remaining || 0);
    });

    return {
      title: "Laporan Tagihan Infaq / SPP",
      subtitle: `Dicetak pada ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`,
      filename: `laporan_infaq_${new Date().toISOString().split("T")[0]}`,
      columns: [
        { header: "No", key: "_no", width: 10, align: "center" },
        { header: "Nama Siswa", key: "student_name", width: 45 },
        { header: "Bulan", key: "month", width: 20, align: "center" },
        { header: "Tagihan", key: "amount", width: 30, align: "right", format: (v) => fmtRupiah(v) },
        { header: "Terbayar", key: "paid", width: 30, align: "right", format: (v) => fmtRupiah(v) },
        { header: "Status", key: "status", width: 20, align: "center", format: (v) => v === "paid" ? "Lunas" : "Belum" },
      ],
      data: infaqData.map((d, i) => ({ ...d, _no: i + 1 })),
      summaryRows: [
        { label: "Total Tagihan", value: fmtRupiah(totalTagihan) },
        { label: "Total Terbayar", value: fmtRupiah(totalBayar) },
        { label: "Total Tunggakan", value: fmtRupiah(totalTunggak) },
      ],
    };
  };

  const getPendaftaranExportOptions = (): ExportOptions => ({
    title: "Laporan Pendaftaran (PPDB & Daftar Ulang)",
    subtitle: `Dicetak pada ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`,
    filename: `laporan_pendaftaran_${new Date().toISOString().split("T")[0]}`,
    columns: [
      { header: "No", key: "_no", width: 10, align: "center" },
      { header: "Nama", key: "name", width: 50 },
      { header: "No Pendaftaran", key: "formNo", width: 35 },
      { header: "Status", key: "status", width: 25, align: "center" },
    ],
    data: pendaftaranData.map((d, i) => ({ ...d, _no: i + 1, formNo: d.registration_number || d.formNo || "-" })),
  });

  const getTabunganExportOptions = (): ExportOptions => {
    let totalSaldo = 0;
    tabunganData.forEach(d => { totalSaldo += Number(d.balance || 0); });

    return {
      title: "Laporan Tabungan Siswa",
      subtitle: `Dicetak pada ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`,
      filename: `laporan_tabungan_${new Date().toISOString().split("T")[0]}`,
      columns: [
        { header: "No", key: "_no", width: 10, align: "center" },
        { header: "Nama Siswa", key: "student_name", width: 50 },
        { header: "Kelas", key: "classroom", width: 30 },
        { header: "Saldo", key: "balance", width: 35, align: "right", format: (v) => fmtRupiah(v) },
      ],
      data: tabunganData.map((d, i) => ({ ...d, _no: i + 1 })),
      summaryRows: [{ label: "Total Saldo", value: fmtRupiah(totalSaldo) }],
    };
  };

  const getAruskasExportOptions = (): ExportOptions => {
    const txns = aruskasData?.transactions || [];
    const pemasukan = Number(aruskasData?.total_income || 0);
    const pengeluaran = Number(aruskasData?.total_expense || 0);

    return {
      title: "Laporan Arus Kas",
      subtitle: `Dicetak pada ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`,
      filename: `laporan_aruskas_${new Date().toISOString().split("T")[0]}`,
      orientation: "landscape",
      columns: [
        { header: "No", key: "_no", width: 10, align: "center" },
        { header: "Tanggal", key: "date", width: 25, format: (v) => v ? new Date(v).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-" },
        { header: "Keterangan", key: "description", width: 60 },
        { header: "Kategori", key: "category", width: 30 },
        { header: "Masuk", key: "_in", width: 30, align: "right", format: (_, r) => r.type === "income" ? fmtRupiah(r.amount) : "-" },
        { header: "Keluar", key: "_out", width: 30, align: "right", format: (_, r) => r.type === "expense" ? fmtRupiah(r.amount) : "-" },
      ],
      data: txns.map((t: any, i: number) => ({ ...t, _no: i + 1 })),
      summaryRows: [
        { label: "Total Pemasukan", value: fmtRupiah(pemasukan) },
        { label: "Total Pengeluaran", value: fmtRupiah(pengeluaran) },
        { label: "Saldo Bersih", value: fmtRupiah(pemasukan - pengeluaran) },
      ],
    };
  };

  // ===== RENDER FUNCTIONS =====

  const renderInfaq = () => {
    if (loading) return <p className="text-center text-slate-400 py-10">Memuat...</p>;
    if (!infaqData || infaqData.length === 0) return <p className="text-center text-slate-400 py-10">Belum ada data tagihan.</p>;

    let totalTagihan = 0, totalBayar = 0, totalTunggak = 0;
    infaqData.forEach(d => {
      totalTagihan += Number(d.amount || 0);
      totalBayar += Number(d.paid || 0);
      totalTunggak += Number(d.remaining || 0);
    });

    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <div />
          <ExportButtons options={getInfaqExportOptions()} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 m-0">Total Tagihan</p>
            <p className="font-extrabold text-lg text-slate-800 mt-1 mb-0">{fmtRp(totalTagihan)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 m-0">Terbayar</p>
            <p className="font-extrabold text-lg text-emerald-600 mt-1 mb-0">{fmtRp(totalBayar)}</p>
          </div>
          <div className="bg-rose-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 m-0">Tunggakan</p>
            <p className="font-extrabold text-lg text-rose-600 mt-1 mb-0">{fmtRp(totalTunggak)}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="p-3 text-xs font-bold text-slate-500 text-left">Siswa</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-left">Bulan</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-right">Tagihan</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-right">Bayar</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {infaqData.map((d, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-sm font-semibold text-slate-800">{d.student_name || "-"}</td>
                  <td className="p-3 text-sm text-slate-600">{d.month || "-"}</td>
                  <td className="p-3 text-sm text-right">{fmtRp(d.amount)}</td>
                  <td className="p-3 text-sm text-right text-emerald-600">{fmtRp(d.paid)}</td>
                  <td className="p-3 text-center">
                    {d.status === 'paid' 
                      ? <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-100 rounded-full">Lunas</span>
                      : <span className="px-2 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-100 rounded-full">Belum</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPendaftaran = () => {
    if (loading) return <p className="text-center text-slate-400 py-10">Memuat...</p>;
    if (!pendaftaranData || pendaftaranData.length === 0) return <p className="text-center text-slate-400 py-10">Belum ada data pendaftaran.</p>;

    const total = pendaftaranData.length;
    let diterima = 0, ditolak = 0, pending = 0;
    pendaftaranData.forEach(d => {
      if (d.status === 'diterima') diterima++;
      else if (d.status === 'ditolak') ditolak++;
      else pending++;
    });

    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <div />
          <ExportButtons options={getPendaftaranExportOptions()} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 m-0">Total Pendaftar</p>
            <p className="font-extrabold text-xl text-slate-800 mt-1 mb-0">{total}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 m-0">Diterima</p>
            <p className="font-extrabold text-xl text-emerald-600 mt-1 mb-0">{diterima}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 m-0">Pending</p>
            <p className="font-extrabold text-xl text-amber-600 mt-1 mb-0">{pending}</p>
          </div>
          <div className="bg-rose-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 m-0">Ditolak</p>
            <p className="font-extrabold text-xl text-rose-500 mt-1 mb-0">{ditolak}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="p-3 text-xs font-bold text-slate-500 text-left">No</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-left">Nama</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-left">No Pendaftaran</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {pendaftaranData.map((d, i) => {
                const stColor = d.status === 'diterima' ? 'text-emerald-700' : d.status === 'ditolak' ? 'text-rose-700' : 'text-amber-700';
                const stBg = d.status === 'diterima' ? 'bg-emerald-100' : d.status === 'ditolak' ? 'bg-rose-100' : 'bg-amber-100';
                return (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-sm text-slate-400">{i + 1}</td>
                    <td className="p-3 text-sm font-semibold text-slate-800">{d.name || "-"}</td>
                    <td className="p-3 text-sm text-slate-600">{d.registration_number || d.formNo || "-"}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${stColor} ${stBg}`}>
                        {d.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTabungan = () => {
    if (loading) return <p className="text-center text-slate-400 py-10">Memuat...</p>;
    if (!tabunganData || tabunganData.length === 0) return <p className="text-center text-slate-400 py-10">Belum ada data tabungan.</p>;

    let totalSaldo = 0;
    tabunganData.forEach(d => { totalSaldo += Number(d.balance || 0); });

    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <div />
          <ExportButtons options={getTabunganExportOptions()} />
        </div>
        <div className="bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl p-5 text-center mb-6">
          <p className="text-xs text-sky-700 m-0">Total Saldo Seluruh Siswa</p>
          <p className="font-extrabold text-2xl text-sky-900 mt-1 mb-0">{fmtRp(totalSaldo)}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="p-3 text-xs font-bold text-slate-500 text-left">No</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-left">Siswa</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-left">Kelas</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {tabunganData.map((d, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-sm text-slate-400">{i + 1}</td>
                  <td className="p-3 text-sm font-semibold text-slate-800">{d.student_name || "-"}</td>
                  <td className="p-3 text-sm text-slate-600">{d.classroom || "-"}</td>
                  <td className={`p-3 text-sm font-bold text-right ${Number(d.balance || 0) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {fmtRp(d.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAruskas = () => {
    if (loading) return <p className="text-center text-slate-400 py-10">Memuat...</p>;
    if (!aruskasData) return <p className="text-center text-slate-400 py-10">Belum ada data arus kas.</p>;

    const pemasukan = Number(aruskasData.total_income || 0);
    const pengeluaran = Number(aruskasData.total_expense || 0);
    const saldo = pemasukan - pengeluaran;
    const txns = aruskasData.transactions || [];

    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <div />
          <ExportButtons options={getAruskasExportOptions()} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 m-0">Total Pemasukan</p>
            <p className="font-extrabold text-lg text-emerald-600 mt-1 mb-0">{fmtRp(pemasukan)}</p>
          </div>
          <div className="bg-rose-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 m-0">Total Pengeluaran</p>
            <p className="font-extrabold text-lg text-rose-600 mt-1 mb-0">{fmtRp(pengeluaran)}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 m-0">Saldo Bersih</p>
            <p className={`font-extrabold text-lg mt-1 mb-0 ${saldo >= 0 ? 'text-slate-800' : 'text-rose-500'}`}>
              {fmtRp(saldo)}
            </p>
          </div>
        </div>

        {txns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200">
                  <th className="p-3 text-xs font-bold text-slate-500 text-left">Tanggal</th>
                  <th className="p-3 text-xs font-bold text-slate-500 text-left">Keterangan</th>
                  <th className="p-3 text-xs font-bold text-slate-500 text-left">Kategori</th>
                  <th className="p-3 text-xs font-bold text-slate-500 text-right">Masuk</th>
                  <th className="p-3 text-xs font-bold text-slate-500 text-right">Keluar</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t: any, i: number) => {
                  const dt = t.date ? new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
                  return (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-sm text-slate-600">{dt}</td>
                      <td className="p-3 text-sm font-semibold text-slate-800">{t.description || "-"}</td>
                      <td className="p-3 text-sm text-slate-500">{t.category || "-"}</td>
                      <td className="p-3 text-sm text-right text-emerald-600">{t.type === 'income' ? fmtRp(t.amount) : '-'}</td>
                      <td className="p-3 text-sm text-right text-rose-600">{t.type === 'expense' ? fmtRp(t.amount) : '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-slate-400 py-4">Belum ada transaksi</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Laporan Lengkap"
        subtitle="Pusat pelaporan keuangan dan operasional madrasah"
        icon={<FileText />}
      />

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={() => setActiveTab('infaq')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${activeTab === 'infaq' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
        >
          Infaq & SPP
        </button>
        <button 
          onClick={() => setActiveTab('pendaftaran')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${activeTab === 'pendaftaran' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
        >
          Pendaftaran
        </button>
        <button 
          onClick={() => setActiveTab('tabungan')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${activeTab === 'tabungan' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
        >
          Tabungan
        </button>
        <button 
          onClick={() => setActiveTab('aruskas')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${activeTab === 'aruskas' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
        >
          Arus Kas
        </button>
      </div>

      {/* Report Panels */}
      <Card noPadding>
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-heading font-bold text-lg text-slate-800 m-0">
            {activeTab === 'infaq' && 'Rekap Tagihan Infaq / SPP'}
            {activeTab === 'pendaftaran' && 'Rekap Pendaftaran (PPDB & Daftar Ulang)'}
            {activeTab === 'tabungan' && 'Rekap Tabungan Siswa'}
            {activeTab === 'aruskas' && 'Laporan Arus Kas'}
          </h3>
        </div>
        <div className="p-6">
          {activeTab === 'infaq' && renderInfaq()}
          {activeTab === 'pendaftaran' && renderPendaftaran()}
          {activeTab === 'tabungan' && renderTabungan()}
          {activeTab === 'aruskas' && renderAruskas()}
        </div>
      </Card>
    </div>
  );
}
