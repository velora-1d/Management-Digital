import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Database, Smartphone } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center text-xl">
            EV
          </div>
          <span className="font-bold text-2xl tracking-tight text-foreground">EduVera</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <Link href="#fitur" className="text-muted-foreground hover:text-primary transition-colors">Fitur</Link>
          <Link href="#solusi" className="text-muted-foreground hover:text-primary transition-colors">Solusi</Link>
          <Link href="#harga" className="text-muted-foreground hover:text-primary transition-colors">Harga</Link>
        </nav>
        <div className="flex space-x-4">
          <Button variant="outline" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild>
            <Link href="/daftar">Coba Gratis</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          <span>Versi MVP v1.0 Kini Tersedia</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl text-foreground mb-6">
          Platform Manajemen Pendidikan Terpadu <span className="text-primary">All-in-One</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Solusi digital untuk sekolah, pesantren, dan yayasan di Indonesia. Kelola akademik, keuangan, SDM, dan kepesantrenan dalam satu sistem.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Button size="lg" className="h-14 px-8 text-lg rounded-full" asChild>
            <Link href="/daftar">
              Mulai 14 Hari Gratis <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full" asChild>
            <Link href="#demo">Lihat Demo</Link>
          </Button>
        </div>
      </section>

      {/* Features / Value Prop */}
      <section id="fitur" className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Solusi Masalah Operasional Anda</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Selamat tinggal pada rapor manual, SPP yang tidak terintegrasi, dan data yang terfragmentasi.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-md">
              <CardHeader>
                <Database className="w-12 h-12 text-primary mb-4 p-2 bg-primary/10 rounded-lg" />
                <CardTitle>Sistem Terintegrasi</CardTitle>
                <CardDescription>Akademik, keuangan, dan absensi terhubung dalam satu database aman (PostgreSQL).</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <ShieldCheck className="w-12 h-12 text-secondary mb-4 p-2 bg-secondary/10 rounded-lg" />
                <CardTitle>Manajemen Multi-Tenant</CardTitle>
                <CardDescription>Satu dashboard untuk yayasan mengelola banyak unit sekolah dan pesantren sekaligus.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <Smartphone className="w-12 h-12 text-accent mb-4 p-2 bg-accent/10 rounded-lg" />
                <CardTitle>Portal Wali & Siswa</CardTitle>
                <CardDescription>Orang tua dapat memantau tagihan, nilai, dan absensi langsung dari HP.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-card text-center">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-primary text-primary-foreground font-bold rounded flex items-center justify-center text-xs">EV</div>
          <span className="font-bold text-lg text-foreground">EduVera</span>
        </div>
        <p className="text-muted-foreground text-sm">© 2026 EduVera Indonesia. Platform Manajemen Pendidikan Terpadu.</p>
      </footer>
    </div>
  );
}
