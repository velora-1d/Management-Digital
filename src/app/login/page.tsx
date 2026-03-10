"use client";
import { useState, useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const animatedRef = useRef(false);

  useEffect(() => {
    fetch("/api/settings/profile")
      .then(r => r.json())
      .then(d => { if (d.name) setSchoolName(d.name); })
      .catch(() => {});
  }, []);

  // Anime.js entrance animations
  useEffect(() => {
    if (animatedRef.current) return;
    animatedRef.current = true;

    // Floating 3D-style icons
    animate(".float-icon", {
      translateY: [-10, 10],
      duration: 2800,
      ease: "inOutSine",
      loop: true,
      alternate: true,
      delay: stagger(350),
    });

    // Feature card entrance stagger
    animate(".feat-card", {
      opacity: [0, 1],
      translateY: [25, 0],
      duration: 650,
      ease: "outCubic",
      delay: stagger(90, { start: 500 }),
    });

    // Main illustration entrance
    animate(".main-illust", {
      opacity: [0, 1],
      scale: [0.88, 1],
      duration: 800,
      ease: "outCubic",
      delay: 250,
    });


    // Login card slide-in
    animate(".login-card", {
      opacity: [0, 1],
      translateX: [35, 0],
      duration: 750,
      ease: "outCubic",
      delay: 450,
    });

    // Slow geometric rotation
    animate(".geo-rotate", {
      rotate: [0, 360],
      duration: 90000,
      ease: "linear",
      loop: true,
    });

    // Particle dots float
    animate(".particle", {
      translateY: [-8, 8],
      translateX: [-4, 4],
      opacity: [0.3, 0.7],
      duration: 3500,
      ease: "inOutSine",
      loop: true,
      alternate: true,
      delay: stagger(200),
    });
  }, []);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Login gagal.");
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }

  const initials = schoolName
    ? schoolName.split(" ").filter(w => w.length > 1).map(w => w[0]).join("").toUpperCase().slice(0, 3)
    : "MD";

  const features = [
    {
      icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      title: "Keuangan & Jurnal",
      desc: "Jurnal umum, SPP, infaq, tabungan siswa",
    },
    {
      icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      title: "Akademik & PPDB",
      desc: "Data siswa, kelas, pendaftaran online",
    },
    {
      icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      title: "Kepegawaian & Gaji",
      desc: "Manajemen guru, staf, dan slip gaji",
    },
    {
      icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      title: "Inventaris Aset",
      desc: "Pencatatan dan pengelolaan barang",
    },
    {
      icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      title: "Laporan & Analitik",
      desc: "Cetak laporan, dashboard analitik",
    },
    {
      icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
      title: "Tabungan & Donasi",
      desc: "Tabungan siswa, infaq, dan wakaf",
    },
  ];

  /* ──────────── 3D-style SVG floating icons ──────────── */
  const FloatingBook = () => (
    <svg className="float-icon" width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ filter: "drop-shadow(0 6px 16px rgba(99,102,241,0.4))" }}>
      <defs>
        <linearGradient id="book-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#6366f1"/></linearGradient>
      </defs>
      <rect x="10" y="8" width="40" height="44" rx="4" fill="url(#book-g)" />
      <rect x="14" y="8" width="36" height="44" rx="3" fill="#eef2ff" />
      <rect x="14" y="8" width="5" height="44" fill="#6366f1" opacity="0.2" />
      <line x1="22" y1="20" x2="42" y2="20" stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="27" x2="38" y2="27" stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="34" x2="35" y2="34" stroke="#e0e7ff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const FloatingGlobe = () => (
    <svg className="float-icon" width="55" height="55" viewBox="0 0 55 55" fill="none" style={{ filter: "drop-shadow(0 6px 16px rgba(59,130,246,0.4))" }}>
      <defs>
        <linearGradient id="globe-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient>
      </defs>
      <circle cx="27.5" cy="27.5" r="22" fill="url(#globe-g)" />
      <ellipse cx="27.5" cy="27.5" rx="10" ry="22" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
      <line x1="5.5" y1="27.5" x2="49.5" y2="27.5" stroke="#fff" strokeWidth="1.2" opacity="0.35" />
      <path d="M8 18 Q27.5 22 47 18" stroke="#fff" strokeWidth="1" opacity="0.25" fill="none" />
      <path d="M8 37 Q27.5 33 47 37" stroke="#fff" strokeWidth="1" opacity="0.25" fill="none" />
      <circle cx="27.5" cy="27.5" r="22" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.3" />
    </svg>
  );

  const FloatingGradCap = () => (
    <svg className="float-icon" width="58" height="50" viewBox="0 0 58 50" fill="none" style={{ filter: "drop-shadow(0 6px 14px rgba(251,191,36,0.35))" }}>
      <defs>
        <linearGradient id="cap-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient>
      </defs>
      <polygon points="29,6 4,20 29,34 54,20" fill="url(#cap-g)" />
      <polygon points="29,10 10,21 29,32 48,21" fill="#fde68a" opacity="0.4" />
      <rect x="27" y="20" width="4" height="18" rx="1" fill="#f59e0b" />
      <circle cx="29" cy="40" r="4" fill="#fbbf24" />
      <line x1="29" y1="40" x2="29" y2="46" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const FloatingPencil = () => (
    <svg className="float-icon" width="20" height="65" viewBox="0 0 20 65" fill="none" style={{ filter: "drop-shadow(0 4px 10px rgba(99,102,241,0.3))" }}>
      <defs>
        <linearGradient id="pencil-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient>
      </defs>
      <rect x="3" y="8" width="14" height="42" rx="2" fill="url(#pencil-g)" />
      <rect x="3" y="8" width="14" height="8" rx="2" fill="#a5b4fc" />
      <polygon points="3,50 17,50 10,62" fill="#fde68a" />
      <polygon points="7,56 13,56 10,62" fill="#374151" />
    </svg>
  );

  const FloatingRuler = () => (
    <svg className="float-icon" width="18" height="60" viewBox="0 0 18 60" fill="none" style={{ filter: "drop-shadow(0 4px 10px rgba(59,130,246,0.3))" }}>
      <rect x="2" y="2" width="14" height="56" rx="2" fill="#3b82f6" opacity="0.85" />
      <rect x="2" y="2" width="7" height="56" rx="2" fill="#60a5fa" opacity="0.5" />
      {[10, 18, 26, 34, 42, 50].map((y, i) => (
        <line key={i} x1="2" y1={y} x2={i % 2 === 0 ? "10" : "7"} y2={y} stroke="#fff" strokeWidth="1.2" opacity="0.5" />
      ))}
    </svg>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* ═══════════════ PANEL KIRI ═══════════════ */}
      <div className="hidden lg:flex" style={{
        width: "55%",
        background: "linear-gradient(155deg, #020617 0%, #0f172a 25%, #1e1b4b 50%, #1e3a5f 75%, #172554 100%)",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* BG decorations */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {/* Ambient glows */}
          <div style={{ position: "absolute", width: 600, height: 600, top: "-15%", right: "-10%", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", width: 500, height: 500, bottom: "-10%", left: "-8%", background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", width: 300, height: 300, top: "40%", left: "50%", background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)", borderRadius: "50%" }} />

          {/* Dot grid */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }} viewBox="0 0 200 200" preserveAspectRatio="none">
            <defs><pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="white" /></pattern></defs>
            <rect width="200" height="200" fill="url(#dots)" />
          </svg>

          {/* Geometric hexagons */}
          <div className="geo-rotate" style={{ position: "absolute", top: "6%", right: "10%", width: 100, height: 100, opacity: 0.05 }}>
            <svg viewBox="0 0 100 100" fill="none"><polygon points="50,5 90,25 90,75 50,95 10,75 10,25" stroke="white" strokeWidth="1.5" /><polygon points="50,20 75,35 75,65 50,80 25,65 25,35" stroke="white" strokeWidth="1" /></svg>
          </div>
          <div style={{ position: "absolute", bottom: "10%", right: "6%", width: 50, height: 50, opacity: 0.04, border: "1.5px solid white", borderRadius: 6, transform: "rotate(45deg)" }} />
          <div style={{ position: "absolute", top: "55%", left: "6%", width: 70, height: 70, opacity: 0.03, border: "2px solid white", borderRadius: "50%" }} />

          {/* Particle dots */}
          {[
            { top: "15%", left: "20%", size: 4 },
            { top: "25%", left: "75%", size: 3 },
            { top: "70%", left: "15%", size: 5 },
            { top: "80%", left: "65%", size: 3 },
            { top: "45%", left: "90%", size: 4 },
          ].map((p, i) => (
            <div key={i} className="particle" style={{
              position: "absolute", top: p.top, left: p.left,
              width: p.size, height: p.size, borderRadius: "50%",
              background: "#818cf8", opacity: 0.3,
            }} />
          ))}
        </div>

        {/* ── Content ── */}
        <div style={{ position: "relative", zIndex: 10, padding: "2rem 1.5rem", maxWidth: 640, width: "100%" }}>

          {/* Floating 3D icons — positioned around illustration */}
          <div style={{ position: "absolute", top: "-1%", left: "3%", transform: "rotate(-12deg)" }}><FloatingBook /></div>
          <div style={{ position: "absolute", top: "2%", right: "5%", transform: "rotate(8deg)" }}><FloatingGlobe /></div>
          <div style={{ position: "absolute", top: "22%", left: "-2%", transform: "rotate(-5deg)" }}><FloatingPencil /></div>
          <div style={{ position: "absolute", top: "15%", right: "-1%", transform: "rotate(15deg)" }}><FloatingGradCap /></div>
          <div style={{ position: "absolute", top: "40%", right: "2%", transform: "rotate(10deg)" }}><FloatingRuler /></div>

          {/* Ilustrasi utama dari Storyset */}
          <div className="main-illust" style={{ textAlign: "center", marginBottom: "1.5rem", opacity: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/learning-illustration.svg"
              alt="Ilustrasi Pembelajaran"
              style={{
                width: "100%", maxWidth: 340, height: "auto", margin: "0 auto",
                filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.25))",
              }}
            />
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
            <h1 style={{
              fontFamily: "var(--font-heading)", fontSize: "1.625rem", fontWeight: 800,
              color: "#fff", margin: "0 0 0.375rem", letterSpacing: "-0.03em", lineHeight: 1.15,
            }}>
              {schoolName || "Management Digital"}
            </h1>
            <div style={{ width: 36, height: 3, background: "linear-gradient(90deg, #818cf8, #3b82f6)", borderRadius: 999, margin: "0 auto 0.625rem" }} />
            <p style={{ color: "rgba(165,180,252,0.8)", fontSize: "0.8125rem", lineHeight: 1.6, margin: 0 }}>
              Sistem Informasi Terintegrasi untuk Pengelolaan Administrasi Sekolah
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {features.map((f, i) => (
              <div key={i} className="feat-card" style={{
                display: "flex", alignItems: "flex-start", gap: "0.625rem",
                padding: "0.75rem 0.875rem",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.875rem",
                backdropFilter: "blur(12px)",
                transition: "all 0.3s ease",
                cursor: "default", opacity: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
                onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(129,140,248,0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.18)"; }}
                onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; }}
              >
                <div style={{
                  width: 36, height: 36, minWidth: 36,
                  background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(59,130,246,0.2))",
                  borderRadius: "0.5rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#a5b4fc", border: "1px solid rgba(165,180,252,0.2)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                }}>{f.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 0.125rem", letterSpacing: "-0.01em" }}>{f.title}</h4>
                  <p style={{ fontSize: "0.625rem", color: "rgba(203,213,225,0.8)", margin: 0, lineHeight: 1.4 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom wave */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ width: "100%", height: 50, display: "block" }}>
            <path d="M0,50 C360,15 720,70 1440,30 L1440,80 L0,80Z" fill="rgba(255,255,255,0.025)" />
          </svg>
        </div>
      </div>

      {/* ═══════════════ PANEL KANAN: FORM LOGIN ═══════════════ */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-5 sm:p-8" style={{
        background: "linear-gradient(160deg, #eef2ff 0%, #e8ecff 20%, #f0f0ff 50%, #f8fafc 100%)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative bg */}
        <div style={{ position: "absolute", top: "-8%", right: "-10%", width: 320, height: 320, background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-8%", left: "-8%", width: 260, height: 260, background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "35%", right: "40%", width: 400, height: 400, background: "radial-gradient(circle, rgba(251,191,36,0.03) 0%, transparent 60%)", borderRadius: "50%", pointerEvents: "none" }} />
        {/* Dot grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.02, pointerEvents: "none" }} viewBox="0 0 200 200" preserveAspectRatio="none">
          <defs><pattern id="rdots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.7" fill="#6366f1" /></pattern></defs>
          <rect width="200" height="200" fill="url(#rdots)" />
        </svg>
        {/* Background illustration (transparan) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/teaching-illustration.svg"
          alt=""
          style={{
            position: "absolute", bottom: "-2%", right: "-4%",
            width: 280, height: "auto", opacity: 0.04,
            pointerEvents: "none", transform: "scaleX(-1)",
          }}
        />

        <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 10 }}>

          {/* Mobile header */}
          <div className="flex flex-col items-center mb-6 lg:hidden">
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", textAlign: "center" }}>
              {schoolName || "Management Digital"}
            </h2>
          </div>

          {/* ═══ SINGLE PREMIUM CARD ═══ */}
          <div className="login-card" style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(28px)",
            borderRadius: "1.25rem",
            overflow: "hidden",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02), 0 12px 48px rgba(99,102,241,0.1), 0 0 0 1px rgba(99,102,241,0.06)",
            border: "1px solid rgba(255,255,255,0.6)",
            opacity: 0,
            position: "relative",
          }}>
            {/* Left gradient border accent */}
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
              background: "linear-gradient(180deg, #4f46e5 0%, #818cf8 40%, #fbbf24 100%)",
              borderRadius: "1.25rem 0 0 1.25rem",
            }} />

            {/* ── Greeting Header ── */}
            <div style={{
              padding: "2rem 2rem 1.25rem 2.25rem",
              background: "linear-gradient(135deg, rgba(238,242,255,0.5) 0%, rgba(224,231,254,0.3) 100%)",
              borderBottom: "1px solid rgba(99,102,241,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {/* Time icon */}
                <div style={{
                  width: 56, height: 56, minWidth: 56,
                  background: (() => {
                    const h = new Date().getHours();
                    if (h >= 5 && h < 11) return "linear-gradient(135deg, #fef3c7, #fde68a)";
                    if (h >= 11 && h < 15) return "linear-gradient(135deg, #dbeafe, #93c5fd)";
                    if (h >= 15 && h < 18) return "linear-gradient(135deg, #fed7aa, #fdba74)";
                    return "linear-gradient(135deg, #1e1b4b, #312e81)";
                  })(),
                  borderRadius: "1rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: (() => {
                    const h = new Date().getHours();
                    if (h >= 5 && h < 11) return "0 4px 20px rgba(251,191,36,0.3)";
                    if (h >= 11 && h < 15) return "0 4px 20px rgba(59,130,246,0.25)";
                    if (h >= 15 && h < 18) return "0 4px 20px rgba(251,146,60,0.3)";
                    return "0 4px 20px rgba(30,27,75,0.35)";
                  })(),
                }}>
                  {(() => {
                    const h = new Date().getHours();
                    if (h >= 5 && h < 11) return (
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#d97706" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    );
                    if (h >= 11 && h < 15) return (
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    );
                    if (h >= 15 && h < 18) return (
                      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#ea580c" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                      </svg>
                    );
                    return (
                      <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#a5b4fc" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                      </svg>
                    );
                  })()}
                </div>
                <div>
                  <h2 style={{
                    fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 800,
                    color: "#0f172a", margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1,
                  }}>
                    {(() => {
                      const h = new Date().getHours();
                      if (h >= 5 && h < 11) return "Selamat Pagi!";
                      if (h >= 11 && h < 15) return "Selamat Siang!";
                      if (h >= 15 && h < 18) return "Selamat Sore!";
                      return "Selamat Malam!";
                    })()}
                  </h2>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0.25rem 0 0", lineHeight: 1.4 }}>
                    Masuk ke sistem untuk memulai aktivitas
                  </p>
                </div>
              </div>
            </div>

            {/* ── Form Section ── */}
            <div style={{ padding: "1.5rem 2rem 1.5rem 2.25rem" }}>
              {/* Error */}
              {error && (
                <div style={{
                  padding: "0.75rem 1rem",
                  background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
                  border: "1px solid #fecdd3", borderRadius: "0.75rem",
                  fontSize: "0.8125rem", fontWeight: 600, color: "#e11d48",
                  marginBottom: "1.125rem",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.999L13.732 4.001c-.77-1.333-2.694-1.333-3.464 0L3.34 16.001C2.57 17.334 3.532 19 5.072 19z" /></svg>
                  {error}
                </div>
              )}

              <form onSubmit={doLogin}>
                {/* Email */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#475569", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Email / Username
                  </label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                    </div>
                    <input
                      type="text" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="nama@email.com" required autoComplete="username"
                      style={{
                        width: "100%", padding: "0.875rem 1rem 0.875rem 2.875rem",
                        border: "1.5px solid #e0e7ff", borderRadius: "0.75rem",
                        fontSize: "0.875rem", color: "#1e293b",
                        background: "#f8f9ff", outline: "none",
                        transition: "all 0.25s ease", boxSizing: "border-box",
                      }}
                      onFocus={e => { e.target.style.borderColor = "#818cf8"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08), 0 2px 8px rgba(99,102,241,0.06)"; }}
                      onBlur={e => { e.target.style.borderColor = "#e0e7ff"; e.target.style.background = "#f8f9ff"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#475569", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <input
                      type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Masukkan password anda..." required autoComplete="current-password"
                      style={{
                        width: "100%", padding: "0.875rem 2.875rem 0.875rem 2.875rem",
                        border: "1.5px solid #e0e7ff", borderRadius: "0.75rem",
                        fontSize: "0.875rem", color: "#1e293b",
                        background: "#f8f9ff", outline: "none",
                        transition: "all 0.25s ease", boxSizing: "border-box",
                      }}
                      onFocus={e => { e.target.style.borderColor = "#818cf8"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08), 0 2px 8px rgba(99,102,241,0.06)"; }}
                      onBlur={e => { e.target.style.borderColor = "#e0e7ff"; e.target.style.background = "#f8f9ff"; e.target.style.boxShadow = "none"; }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                      position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", padding: "0.25rem",
                      color: showPass ? "#6366f1" : "#94a3b8", transition: "color 0.2s ease",
                    }}>
                      {showPass ? (
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "0.9375rem 1.5rem",
                  border: "none", borderRadius: "0.75rem",
                  fontSize: "0.9375rem", fontWeight: 700, color: "#fff",
                  background: loading ? "#94a3b8" : "linear-gradient(135deg, #312e81, #4f46e5, #6366f1)",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(79,70,229,0.35)",
                  letterSpacing: "0.02em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem",
                }}
                  onMouseOver={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(79,70,229,0.45)"; }}}
                  onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 20px rgba(79,70,229,0.35)"; }}
                >
                  {loading ? (
                    <>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg>
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk Sekarang
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </>
                  )}
                </button>
              </form>

              {/* Help text */}
              <div style={{ textAlign: "center", marginTop: "1.125rem" }}>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
                  Lupa password? Hubungi administrator sekolah
                </p>
              </div>
            </div>

            {/* Card footer badges */}
            <div style={{
              padding: "0.75rem 2rem",
              background: "linear-gradient(135deg, rgba(238,242,255,0.6), rgba(224,231,254,0.4))",
              borderTop: "1px solid rgba(99,102,241,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span style={{ fontSize: "0.625rem", color: "#64748b", fontWeight: 600 }}>Terenkripsi</span>
              </div>
              <div style={{ width: 1, height: 14, background: "rgba(99,102,241,0.12)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span style={{ fontSize: "0.625rem", color: "#64748b", fontWeight: 600 }}>Aman</span>
              </div>
              <div style={{ width: 1, height: 14, background: "rgba(99,102,241,0.12)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span style={{ fontSize: "0.625rem", color: "#64748b", fontWeight: 600 }}>Online 24/7</span>
              </div>
            </div>
          </div>

          {/* Footer copyright */}
          <p style={{ textAlign: "center", fontSize: "0.625rem", color: "#94a3b8", marginTop: "1rem", fontWeight: 500 }}>
            © {new Date().getFullYear()} {schoolName || "Management Digital"} — Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
