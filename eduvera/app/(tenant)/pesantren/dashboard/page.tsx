import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Home, Moon, BookOpen, AlertCircle, Wallet, FileText, CreditCard } from "lucide-react";

export default function DashboardPesantren() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Pesantren</h1>
          <p className="text-muted-foreground mt-1">Selamat datang kembali, Ustadz. Anda login sebagai Admin Pesantren.</p>
        </div>
        <div className="text-sm font-medium bg-muted px-4 py-2 rounded-lg border border-border">
          📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">320 <span className="text-sm font-normal text-muted-foreground">Aktif</span></div>
            <p className="text-xs text-muted-foreground mt-1">
              Mukim: 285, Non-mukim: 35
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Asrama Aktif</CardTitle>
            <Home className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6 <span className="text-sm font-normal text-muted-foreground">Gedung</span></div>
            <p className="text-xs text-muted-foreground mt-1">
              Kapasitas: 320/350 terisi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Absensi Malam</CardTitle>
            <Moon className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96% <span className="text-sm font-normal text-muted-foreground">Hadir</span></div>
            <p className="text-xs text-muted-foreground mt-1">
              12 Izin, 3 Alpha
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tahfidz Global</CardTitle>
            <BookOpen className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">68% <span className="text-sm font-normal text-muted-foreground">On-track</span></div>
            <p className="text-xs text-muted-foreground mt-1">
              Target Rata-rata: 2 Juz/semester
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-destructive">Pelanggaran Hari Ini</CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">5 <span className="text-sm font-normal text-destructive/80">Kasus</span></div>
            <p className="text-xs text-destructive/80 mt-1 font-medium">
              ⚠️ 2 Tingkat BERAT
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Saldo Kas (Yayasan/Pesantren)</CardTitle>
            <Wallet className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">Rp 125jt</div>
            <p className="text-xs text-muted-foreground mt-1">
              Termasuk Dana Wakaf Rp 45jt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Status Rapor</CardTitle>
            <FileText className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">56% <span className="text-sm font-normal text-muted-foreground">Selesai</span></div>
            <p className="text-xs text-muted-foreground mt-1">
              180/320 rapor telah di-publish
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Syahriyah (SPP) Bulan Ini</CardTitle>
            <CreditCard className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82% <span className="text-sm font-normal text-muted-foreground">Lunas</span></div>
            <p className="text-xs text-destructive mt-1 font-medium">
              Tunggakan Rp 28jt
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Log Pelanggaran & Izin Terbaru</CardTitle>
            <CardDescription>Daftar aktivitas santri yang perlu perhatian Musyrif/Pengurus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nama Santri</th>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium">Status/Tindakan</th>
                    <th className="px-4 py-3 font-medium text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">Hasan Al-Banna</td>
                    <td className="px-4 py-3 text-destructive font-medium">Pelanggaran Berat</td>
                    <td className="px-4 py-3">
                      <span className="bg-destructive/10 text-destructive text-xs px-2 py-1 rounded-full font-medium">Belum Diproses</span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">10 mnt lalu</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">Aisyah Nur</td>
                    <td className="px-4 py-3 text-accent font-medium">Izin Pulang</td>
                    <td className="px-4 py-3">
                      <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded-full font-medium">Menunggu Acc</span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">1 jam lalu</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">Fatih Muhammad</td>
                    <td className="px-4 py-3 text-muted-foreground">Terlambat Jamaah</td>
                    <td className="px-4 py-3">
                      <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full font-medium">Takzir Ringan</span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">Subuh</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setoran Tahfidz (Halaqah Teraktif)</CardTitle>
            <CardDescription>Perkembangan tahfidz berdasarkan halaqah hari ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Halaqah Ustadz Ali (Putra)</span>
                <span className="text-muted-foreground">15/15 Santri Setor (100%)</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-full"></div>
              </div>
              <p className="text-xs text-muted-foreground">Rata-rata ziadah: 1 halaman</p>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Halaqah Ustadzah Fatimah (Putri)</span>
                <span className="text-muted-foreground">12/15 Santri Setor (80%)</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[80%]"></div>
              </div>
              <p className="text-xs text-muted-foreground">Rata-rata ziadah: 0.5 halaman</p>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Halaqah Ustadz Umar (Tahsin)</span>
                <span className="text-muted-foreground">8/20 Santri Setor (40%)</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[40%]"></div>
              </div>
              <p className="text-xs text-accent">Perhatian: Tingkat kehadiran halaqah rendah hari ini</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
