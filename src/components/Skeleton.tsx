"use client";

/**
 * Skeleton — Komponen loading placeholder yang elegan.
 * 
 * Menampilkan kotak abu-abu berkedip (shimmer) selagi data dimuat.
 * Bisa dikonfigurasi untuk berbagai bentuk: teks, kartu, tabel, avatar, dll.
 */

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = "0.5rem", className = "", style }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

/** Skeleton untuk satu baris tabel */
export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "1rem 1.5rem" }}>
          <Skeleton height={14} width={i === 0 ? 30 : i === 1 ? "70%" : "50%"} />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton untuk tabel lengkap */
export function SkeletonTable({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
      {/* Header shimmer */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Skeleton width={8} height={8} borderRadius="50%" />
        <Skeleton width={120} height={14} />
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} style={{ padding: "0.875rem 1.5rem", borderBottom: "1.5px solid #e2e8f0" }}>
                <Skeleton height={10} width={i === 0 ? 30 : 80} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Skeleton untuk kartu KPI / stat */
export function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton width={100} height={12} />
        <Skeleton width={36} height={36} borderRadius="0.75rem" />
      </div>
      <Skeleton width={80} height={28} />
      <Skeleton width={140} height={10} />
    </div>
  );
}

/** Skeleton untuk hero header */
export function SkeletonHero() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)",
      borderRadius: "1rem",
      padding: "2rem",
      animation: "shimmer 2s ease-in-out infinite",
      backgroundSize: "200% 100%",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Skeleton width={44} height={44} borderRadius="0.75rem" style={{ background: "rgba(255,255,255,0.2)" }} />
        <div>
          <Skeleton width={180} height={18} style={{ background: "rgba(255,255,255,0.2)", marginBottom: 6 }} />
          <Skeleton width={250} height={12} style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>
    </div>
  );
}

/** Skeleton untuk halaman penuh (Hero + Table) */
export function SkeletonPage() {
  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.3s ease-out" }}>
      <SkeletonHero />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable />
    </div>
  );
}
