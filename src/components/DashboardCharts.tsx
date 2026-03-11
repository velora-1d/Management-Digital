"use client";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar,
} from "recharts";

const COLORS_GENDER = ["#6366f1", "#f59e0b"];
const COLORS_PPDB = ["#f59e0b", "#10b981", "#f43f5e", "#6366f1"];
const COLORS_SDM = ["#8b5cf6", "#0ea5e9"];

function fmtRp(n: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

export default function DashboardCharts({ data, tab = "overview" }: { data: any; tab?: string }) {
  const genderData = [
    { name: "Putra", value: data.totalSiswaPa },
    { name: "Putri", value: data.totalSiswaPi },
  ];

  const ppdbData = [
    { name: "Pending", value: data.ppdbPending },
    { name: "Diterima", value: data.ppdbDiterima },
  ];

  const kasData = [
    { name: "Pemasukan", masuk: data.pemasukanBulanIni, keluar: 0 },
    { name: "Pengeluaran", masuk: 0, keluar: data.pengeluaranBulanIni },
  ];

  const sdmData = [
    { name: "Guru", value: data.totalGuru },
    { name: "Staff", value: data.totalStaff },
  ];

  const complianceData = [
    { name: "Lunas", value: data.complianceRate, fill: data.complianceRate >= 80 ? "#10b981" : data.complianceRate >= 50 ? "#f59e0b" : "#f43f5e" },
  ];

  const tunggakanData = [
    { name: "Putra", value: data.tunggakanPa },
    { name: "Putri", value: data.tunggakanPi },
  ];

  const danaData = [
    { name: "Tabungan", value: data.saldoTabungan },
    { name: "Wakaf", value: data.totalWakaf },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#1e293b", color: "#fff", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{payload[0].name || label}</p>
        <p style={{ margin: "2px 0 0", color: "#94a3b8" }}>{typeof payload[0].value === "number" && payload[0].value > 999 ? fmtRp(payload[0].value) : payload[0].value}</p>
      </div>
    );
  };

  const cardStyle: React.CSSProperties = { background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem", overflow: "hidden" };
  const titleStyle: React.CSSProperties = { fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" };

  // Grafik 1: Distribusi Siswa
  const ChartDistribusiSiswa = () => (
    <div style={cardStyle}>
      <p style={titleStyle}>Distribusi Siswa</p>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={genderData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3} strokeWidth={0}>
            {genderData.map((_, i) => <Cell key={i} fill={COLORS_GENDER[i]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.6875rem" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  // Grafik 2: Status PPDB
  const ChartStatusPPDB = () => (
    <div style={cardStyle}>
      <p style={titleStyle}>Status PPDB</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={ppdbData} layout="vertical" margin={{ left: 0, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} axisLine={false} tickLine={false} width={65} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
            {ppdbData.map((_, i) => <Cell key={i} fill={COLORS_PPDB[i]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  // Grafik 3: Arus Kas
  const ChartArusKas = () => (
    <div style={cardStyle}>
      <p style={titleStyle}>Arus Kas Bulan Ini</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={kasData} margin={{ left: 0, right: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}jt` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}rb` : v} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="masuk" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} name="Masuk" />
          <Bar dataKey="keluar" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={30} name="Keluar" />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: "center", padding: "0.375rem", background: data.pemasukanBulanIni >= data.pengeluaranBulanIni ? "#ecfdf5" : "#fff1f2", borderRadius: "0.5rem", fontSize: "0.6875rem", fontWeight: 700, color: data.pemasukanBulanIni >= data.pengeluaranBulanIni ? "#059669" : "#e11d48", marginTop: "0.5rem" }}>
        Saldo: {fmtRp(data.pemasukanBulanIni - data.pengeluaranBulanIni)}
      </div>
    </div>
  );

  // Grafik 4: Komposisi SDM
  const ChartKomposisiSDM = () => (
    <div style={cardStyle}>
      <p style={titleStyle}>Komposisi SDM</p>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={sdmData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3} strokeWidth={0}>
            {sdmData.map((_, i) => <Cell key={i} fill={COLORS_SDM[i]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.6875rem" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  // Grafik 5: Kepatuhan SPP
  const ChartKepatuhanSPP = () => (
    <div style={cardStyle}>
      <p style={titleStyle}>Kepatuhan SPP</p>
      <div style={{ position: "relative" }}>
        <ResponsiveContainer width="100%" height={180}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={90} endAngle={-270} data={complianceData} barSize={12}>
            <RadialBar background={{ fill: "#f1f5f9" }} dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#1e293b", margin: 0 }}>{data.complianceRate}%</p>
          <p style={{ fontSize: "0.5625rem", color: "#94a3b8", margin: "2px 0 0" }}>Lunas</p>
        </div>
      </div>
    </div>
  );

  // Grafik 6: Distribusi Tunggakan
  const ChartDistribusiTunggakan = () => (
    <div style={cardStyle}>
      <p style={titleStyle}>Distribusi Tunggakan</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={tunggakanData} margin={{ left: 0, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={35} name="Siswa">
            {tunggakanData.map((_, i) => <Cell key={i} fill={["#6366f1", "#f59e0b"][i]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: "center", padding: "0.375rem", background: "#fff1f2", borderRadius: "0.5rem", fontSize: "0.6875rem", fontWeight: 700, color: "#e11d48", marginTop: "0.5rem" }}>
        Total: {data.tunggakanTotal} siswa
      </div>
    </div>
  );

  // Grafik 7: Tabungan vs Wakaf
  const ChartTabunganWakaf = () => (
    <div style={cardStyle}>
      <p style={titleStyle}>Tabungan vs Wakaf</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={danaData} layout="vertical" margin={{ left: 5, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}jt` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}rb` : v} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} axisLine={false} tickLine={false} width={70} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} name="Nominal">
            {danaData.map((_, i) => <Cell key={i} fill={["#06b6d4", "#d97706"][i]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  // Grafik 8: Ringkasan Keuangan
  const ChartRingkasanKeuangan = () => (
    <div style={{ background: "linear-gradient(135deg,#312e81,#1e1b4b)", borderRadius: "1rem", padding: "1.25rem", color: "#fff", display: "flex", flexDirection: "column", height: "100%" }}>
      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Ringkasan Keuangan</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", flex: 1, justifyContent: "center" }}>
        {[
          { label: "Pemasukan", value: fmtRp(data.pemasukanBulanIni), color: "#34d399" },
          { label: "Pengeluaran", value: fmtRp(data.pengeluaranBulanIni), color: "#fb7185" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>{item.label}</span>
            <strong style={{ fontSize: "0.9375rem", color: item.color }}>{item.value}</strong>
          </div>
        ))}
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
        {[
          { label: "Tabungan", value: fmtRp(data.saldoTabungan), color: "#67e8f9" },
          { label: "Wakaf", value: fmtRp(data.totalWakaf), color: "#fcd34d" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>{item.label}</span>
            <strong style={{ fontSize: "0.9375rem", color: item.color }}>{item.value}</strong>
          </div>
        ))}
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Saldo Bulan Ini</span>
          <strong style={{ fontSize: "1.125rem", color: data.pemasukanBulanIni >= data.pengeluaranBulanIni ? "#34d399" : "#fb7185" }}>
            {fmtRp(data.pemasukanBulanIni - data.pengeluaranBulanIni)}
          </strong>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ChartDistribusiSiswa />
          <ChartStatusPPDB />
          <ChartArusKas />
          <ChartKomposisiSDM />
        </div>
      )}

      {tab === "finance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ChartArusKas />
          <ChartKepatuhanSPP />
          <ChartDistribusiTunggakan />
          <ChartRingkasanKeuangan />
          <div className="md:col-span-2 lg:col-span-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ChartTabunganWakaf />
            </div>
          </div>
        </div>
      )}

      {tab === "academic" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ChartDistribusiSiswa />
          <ChartStatusPPDB />
        </div>
      )}

      {tab === "hr" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ChartKomposisiSDM />
        </div>
      )}
    </>
  );
}
