import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Users, Wallet, GraduationCap, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DashboardYayasan() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Super Admin Yayasan</h1>
          <p className="text-muted-foreground mt-1">Yayasan Pendidikan Al-Falah | Mengelola 4 Unit Pendidikan</p>
        </div>
        <div className="text-sm font-medium bg-muted px-4 py-2 rounded-lg border border-border">
          📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Unit Pendidikan</CardTitle>
            <Building2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 <span className="text-sm font-normal text-muted-foreground">Unit Aktif</span></div>
            <p className="text-xs text-muted-foreground mt-1">
              SD (1), SMP (1), SMA (1), Pesantren (1)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Seluruh Siswa/Santri</CardTitle>
            <Users className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,450</div>
            <p className="text-xs text-muted-foreground mt-1">
              +120 pendaftaran baru tahun ajaran ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Seluruh SDM</CardTitle>
            <GraduationCap className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground mt-1">
              Guru: 85, Musyrif: 20, Staf: 23
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Keuangan Konsolidasi (Bulan Ini)</CardTitle>
            <CardDescription>Ringkasan penerimaan dan pengeluaran seluruh unit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-full">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Penerimaan (SPP, dll)</p>
                  <p className="text-xs text-muted-foreground">Target tercapai 85%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-secondary">Rp 485.500.000</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-full">
                  <Wallet className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Pengeluaran (Gaji, Ops)</p>
                  <p className="text-xs text-muted-foreground">Termasuk operasional pesantren</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-destructive">Rp 320.000.000</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20 mt-2">
              <p className="text-sm font-bold text-primary">Saldo Bersih Yayasan</p>
              <p className="font-bold text-lg text-primary">Rp 165.500.000</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performa Unit Pendidikan</CardTitle>
            <CardDescription>Pantau status kesehatan setiap sekolah/pesantren</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/sekolah/dashboard" className="block">
                <div className="flex items-center justify-between p-3 hover:bg-muted transition-colors rounded-md border border-transparent hover:border-border cursor-pointer">
                  <div>
                    <p className="font-medium text-sm text-primary hover:underline">SDIT Al-Falah</p>
                    <p className="text-xs text-muted-foreground">450 Siswa | SPP 92% Lunas</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full font-medium">Sehat</span>
                  </div>
                </div>
              </Link>

              <Link href="/sekolah/dashboard" className="block">
                <div className="flex items-center justify-between p-3 hover:bg-muted transition-colors rounded-md border border-transparent hover:border-border cursor-pointer">
                  <div>
                    <p className="font-medium text-sm text-primary hover:underline">SMPIT Al-Falah</p>
                    <p className="text-xs text-muted-foreground">380 Siswa | SPP 85% Lunas</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full font-medium">Sehat</span>
                  </div>
                </div>
              </Link>

              <Link href="/sekolah/dashboard" className="block">
                <div className="flex items-center justify-between p-3 hover:bg-muted transition-colors rounded-md border border-transparent hover:border-border cursor-pointer">
                  <div>
                    <p className="font-medium text-sm text-primary hover:underline">SMAIT Al-Falah</p>
                    <p className="text-xs text-muted-foreground">300 Siswa | SPP 78% Lunas</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-accent" />
                    <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded-full font-medium">Perhatian</span>
                  </div>
                </div>
              </Link>

              <Link href="/pesantren/dashboard" className="block">
                <div className="flex items-center justify-between p-3 hover:bg-muted transition-colors rounded-md border border-transparent hover:border-border cursor-pointer">
                  <div>
                    <p className="font-medium text-sm text-primary hover:underline">Pesantren Tahfidz Al-Falah</p>
                    <p className="text-xs text-muted-foreground">320 Santri | Kapasitas Asrama 95%</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full font-medium">Sangat Baik</span>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
