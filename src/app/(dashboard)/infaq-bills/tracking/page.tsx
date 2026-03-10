"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const semesterMonths: Record<number, number[]> = {
  1: [7, 8, 9, 10, 11, 12],
  2: [1, 2, 3, 4, 5, 6],
};
const monthNames: Record<number, string> = {
  1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "Mei", 6: "Jun",
  7: "Jul", 8: "Agu", 9: "Sep", 10: "Okt", 11: "Nov", 12: "Des",
};

export default function TrackingPerKelasPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [classroomId, setClassroomId] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [semester, setSemester] = useState("1");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);

  // Bayar modal
  const [payModal, setPayModal] = useState(false);
  const [payTarget, setPayTarget] = useState<any>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("tunai");
  const [payCashId, setPayCashId] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [savingBalance, setSavingBalance] = useState<number | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch("/api/classrooms").then(r => r.json()).then(j => { if (j.success) setClassrooms(j.data); });
    fetch("/api/cash-accounts").then(r => r.json()).then(j => { if (j.success) setCashAccounts(j.data); });
  }, []);

  const loadTracking = useCallback(async () => {
    if (!classroomId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/infaq-bills/tracking?classroomId=${classroomId}&year=${year}&semester=${semester}`);
      const json = await res.json();
      if (json.success) setData(json);
      else { setData(null); showToast(json.message, "error"); }
    } catch { showToast("Gagal memuat data", "error"); }
    finally { setLoading(false); }
  }, [classroomId, year, semester]);

  useEffect(() => { loadTracking(); }, [loadTracking]);

  const fmtRp = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

  // === Aksi ===
  async function handleEditNominal(billId: string, studentName: string, currentNominal: number) {
    const { value: newValStr } = await Swal.fire({
      title: "Edit Nominal",
      input: "number",
      inputLabel: `Edit nominal tagihan untuk ${studentName}`,
      inputValue: currentNominal,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal"
    });
    if (newValStr === undefined || newValStr === null || newValStr === "") return;
    const newVal = parseInt(newValStr, 10);
    if (isNaN(newVal) || newVal < 0) {
      Swal.fire("Error", "Nominal tidak valid", "error");
      return;
    }
    try {
      const res = await fetch(`/api/infaq-bills/${billId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nominal: Number(newVal) }),
      });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadTracking(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal edit", "error"); }
  }

  async function handleDelete(billId: string) {
    const result = await Swal.fire({
      title: "Hapus Tagihan?",
      text: "Hapus tagihan ini? Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus"
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/infaq-bills/${billId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadTracking(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal hapus", "error"); }
  }

  async function handleRevert(billId: string) {
    const result = await Swal.fire({
      title: "Batalkan Pelunasan?",
      text: "Ubah status tagihan ini menjadi belum lunas?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Batalkan"
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/infaq-bills/${billId}/revert`, { method: "POST" });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadTracking(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal revert", "error"); }
  }

  async function openPay(student: any, monthData: any) {
    setPayTarget({ studentId: student.id, studentName: student.name, billId: monthData.billId, month: monthData.month, nominal: monthData.nominal, remaining: monthData.remaining });
    setPayAmount(String(monthData.remaining));
    setPayMethod("tunai");
    setPayCashId("");
    setSavingBalance(null);
    setPayModal(true);
    // Fetch saldo tabungan siswa
    try {
      const res = await fetch(`/api/tabungan?studentId=${student.id}`);
      const json = await res.json();
      if (json.success) setSavingBalance(json.balance ?? json.data?.balance ?? 0);
    } catch { /* ignore */ }
  }

  async function handlePayConfirm() {
    if (!payTarget?.billId || !payAmount) return;
    setPayLoading(true);
    try {
      const res = await fetch("/api/infaq-payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId: payTarget.billId,
          amountPaid: Number(payAmount),
          paymentMethod: payMethod,
          cashAccountId: payCashId || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) { showToast(json.message); setPayModal(false); loadTracking(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal bayar", "error"); }
    finally { setPayLoading(false); }
  }

  // Badge render
  const renderBadge = (student: any, m: any) => {
    if (m.status === "belum_digenerate") {
      return <span style={{ color: "#cbd5e1", fontSize: "0.75rem" }}>—</span>;
    }

    const isLunas = m.status === "lunas";
    const isVoid = m.status === "void";
    const isSebagian = m.status === "sebagian";

    const bg = isLunas ? "#dcfce7" : isVoid ? "#f1f5f9" : isSebagian ? "#dbeafe" : "#fef2f2";
    const color = isLunas ? "#166534" : isVoid ? "#94a3b8" : isSebagian ? "#1e40af" : "#991b1b";
    const label = isLunas ? "✓" : isVoid ? "✗" : isSebagian ? "◐" : "○";

    return (
      <div style={{ position: "relative", display: "inline-block" }} className="group">
        <button
          style={{
            padding: "0.25rem 0.5rem", borderRadius: "0.375rem", border: "none",
            background: bg, color, fontSize: "0.6875rem", fontWeight: 700,
            cursor: isVoid ? "default" : "pointer", minWidth: 32,
          }}
          title={`${m.monthName}: ${fmtRp(m.nominal)} | Bayar: ${fmtRp(m.totalPaid)} | Sisa: ${fmtRp(m.remaining)}`}
          onClick={(e) => { if (isVoid) return; e.stopPropagation(); }}
        >
          {label}
        </button>
        {/* Dropdown aksi */}
        {!isVoid && (
          <div className="group-hover:flex" style={{
            display: "none", position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "0.25rem", marginTop: 4,
            flexDirection: "column", gap: "0.125rem", minWidth: 80,
          }}>
            {(m.status === "belum_lunas" || m.status === "sebagian") && (
              <>
                <button onClick={() => openPay(student, m)} style={dropBtn("#059669")}>Bayar</button>
                <button onClick={() => handleEditNominal(m.billId, m.nominal, student.name)} style={dropBtn("#6366f1")}>Edit</button>
                <button onClick={() => handleDelete(m.billId)} style={dropBtn("#64748b")}>Hapus</button>
              </>
            )}
            {isLunas && (
              <button onClick={() => handleRevert(m.billId)} style={dropBtn("#d97706")}>Revert</button>
            )}
          </div>
        )}
      </div>
    );
  };

  const dropBtn = (color: string): React.CSSProperties => ({
    display: "block", width: "100%", padding: "0.3rem 0.5rem", fontSize: "0.6875rem",
    fontWeight: 600, color, background: "none", border: "none", borderRadius: "0.25rem",
    cursor: "pointer", textAlign: "left", whiteSpace: "nowrap",
  });

  const months = data?.months || [];

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>Tracking SPP/Infaq Per Kelas</h1>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>Pantau pembayaran SPP seluruh siswa per kelas</p>
        </div>
        <button onClick={() => router.push("/infaq-bills")} style={{
          padding: "0.5rem 1rem", fontSize: "0.8125rem", fontWeight: 600, color: "#6366f1",
          background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "0.5rem", cursor: "pointer",
        }}>← Kembali ke Tagihan</button>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <select value={classroomId} onChange={e => setClassroomId(e.target.value)}
          style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.8125rem", minWidth: 160 }}>
          <option value="">— Pilih Kelas —</option>
          {classrooms.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)}
          style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.8125rem" }}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={semester} onChange={e => setSemester(e.target.value)}
          style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.8125rem" }}>
          <option value="1">Semester 1 (Jul–Des)</option>
          <option value="2">Semester 2 (Jan–Jun)</option>
        </select>
      </div>

      {/* Ringkasan */}
      {data?.summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Jumlah Siswa", value: data.summary.totalStudents, fmt: false, color: "#6366f1" },
            { label: "Total Kewajiban", value: data.summary.totalNominal, fmt: true, color: "#6366f1" },
            { label: "Terbayar", value: data.summary.totalPaid, fmt: true, color: "#22c55e" },
            { label: "Tunggakan", value: data.summary.totalRemaining, fmt: true, color: "#ef4444" },
            { label: "Lunas Semua", value: data.summary.allLunas, fmt: false, color: "#22c55e" },
            { label: "Ada Tunggakan", value: data.summary.hasArrears, fmt: false, color: "#ef4444" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "0.75rem", borderRadius: "0.625rem", background: "#fff", border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: "0.625rem", color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontSize: "1.125rem", fontWeight: 700, color: s.color, margin: "0.125rem 0 0" }}>
                {s.fmt ? fmtRp(s.value) : s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tabel Grid */}
      {!classroomId ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Pilih kelas untuk melihat tracking</div>
      ) : loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Memuat data...</div>
      ) : !data?.tracking?.length ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Tidak ada siswa di kelas ini</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0", position: "sticky", left: 0, background: "#f8fafc", minWidth: 180 }}>Nama Siswa</th>
                {months.map((m: any) => (
                  <th key={m.month} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0", minWidth: 50 }}>{m.name}</th>
                ))}
                <th style={{ padding: "0.75rem 0.75rem", textAlign: "right", fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0", minWidth: 100 }}>Tunggakan</th>
              </tr>
            </thead>
            <tbody>
              {data.tracking.map((student: any) => (
                <tr key={student.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.625rem 1rem", fontWeight: 500, color: "#1e293b", position: "sticky", left: 0, background: "#fff", borderRight: "1px solid #f1f5f9" }}>
                    <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 600 }}>{student.name}</p>
                    <p style={{ margin: 0, fontSize: "0.625rem", color: "#94a3b8" }}>{student.nisn || "-"}</p>
                  </td>
                  {student.months.map((m: any) => (
                    <td key={m.month} style={{ padding: "0.375rem", textAlign: "center" }}>
                      {renderBadge(student, m)}
                    </td>
                  ))}
                  <td style={{ padding: "0.625rem 0.75rem", textAlign: "right", fontWeight: 600, color: student.totalRemaining > 0 ? "#ef4444" : "#22c55e", fontSize: "0.75rem" }}>
                    {student.totalRemaining > 0 ? fmtRp(student.totalRemaining) : "✓ Lunas"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Bayar */}
      {payModal && payTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={() => setPayModal(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", padding: "1.5rem", width: "100%", maxWidth: 400, boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b", margin: "0 0 0.25rem" }}>Bayar SPP</h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0 0 1rem" }}>
              {payTarget.studentName} — {monthNames[payTarget.month]} | Sisa: {fmtRp(payTarget.remaining)}
            </p>

            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>Jumlah Bayar</label>
            <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.875rem", marginBottom: "0.75rem", boxSizing: "border-box" }} />

            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>Metode</label>
            <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
              <option value="tunai">Tunai</option>
              <option value="transfer">Transfer</option>
              <option value="tabungan">Potong Tabungan</option>
            </select>

            {payMethod === "tabungan" && (
              <div style={{ padding: "0.5rem 0.75rem", background: "#eff6ff", borderRadius: "0.5rem", marginBottom: "0.75rem", fontSize: "0.8125rem" }}>
                <span style={{ fontWeight: 600, color: "#1e40af" }}>💰 Saldo Tabungan: </span>
                <span style={{ fontWeight: 700, color: savingBalance !== null && savingBalance < Number(payAmount) ? "#ef4444" : "#059669" }}>
                  {savingBalance !== null ? fmtRp(savingBalance) : "Memuat..."}
                </span>
                {savingBalance !== null && savingBalance < Number(payAmount) && (
                  <p style={{ fontSize: "0.6875rem", color: "#ef4444", margin: "0.25rem 0 0", fontWeight: 600 }}>⚠️ Saldo tidak mencukupi!</p>
                )}
              </div>
            )}

            {payMethod !== "tabungan" && (
              <>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>Akun Kas</label>
                <select value={payCashId} onChange={e => setPayCashId(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.875rem", marginBottom: "1rem" }}>
                  <option value="">— Pilih Akun Kas —</option>
                  {cashAccounts.map((ca: any) => <option key={ca.id} value={ca.id}>{ca.name}</option>)}
                </select>
              </>
            )}

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button onClick={() => setPayModal(false)} style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>Batal</button>
              <button onClick={handlePayConfirm} disabled={payLoading}
                style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", fontWeight: 600, color: "#fff", background: payLoading ? "#94a3b8" : "linear-gradient(135deg,#059669,#047857)", border: "none", borderRadius: "0.5rem", cursor: payLoading ? "default" : "pointer" }}>
                {payLoading ? "Memproses..." : "Bayar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, padding: "0.75rem 1.25rem", borderRadius: "0.75rem",
          background: toast.type === "error" ? "#fef2f2" : "#f0fdf4", color: toast.type === "error" ? "#991b1b" : "#166534",
          border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`, fontWeight: 600, fontSize: "0.8125rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 200,
        }}>{toast.msg}</div>
      )}

      <style jsx>{`
        .group:hover > div[class*="group-hover"] { display: flex !important; }
        .group > div:last-child:hover { display: flex !important; }
      `}</style>
    </div>
  );
}
