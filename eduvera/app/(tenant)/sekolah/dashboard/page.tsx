import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, GraduationCap, CalendarCheck, Wallet, FileText, CreditCard, Building, AlertTriangle } from "lucide-react";

export default function DashboardSekolah() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Sekolah</h1>
          <p className="text-muted-foreground mt-1">Selamat datang kembali, Ahmad Guru. Anda login sebagai Admin Sekolah.</p>
        </div>
        <div className="text-sm font-medium bg-muted px-4 py-2 rounded-lg border border-border">
          📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktif: SD 120, SMP 180, SMA 150
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
            <GraduationCap className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktif: PNS 10, Honor 22
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Absensi Hari Ini</CardTitle>
            <CalendarCheck className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92% <span className="text-sm font-normal text-muted-foreground">Hadir</span></div>
            <p className="text-xs text-muted-foreground mt-1">
              35 Alpha, 3 Sakit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Saldo Kas</CardTitle>
            <Wallet className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">Rp 48.5jt</div>
            <p className="text-xs text-muted-foreground mt-1">
              ↑ SPP bulan ini terkumpul
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Status Rapor</CardTitle>
            <FileText className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8/12 <span className="text-sm font-normal text-muted-foreground">Kelas</span></div>
            <p className="text-xs text-accent mt-1 font-medium">
              4 kelas belum di-publish
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">SPP Bulan Ini</CardTitle>
            <CreditCard className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78% <span className="text-sm font-normal text-muted-foreground">Lunas</span></div>
            <p className="text-xs text-destructive mt-1 font-medium">
              Rp 12jt total tunggakan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Staf</CardTitle>
            <Building className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktif: TU 5, Keu 3, Lainnya 10
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-destructive">Perlu Perhatian</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">20 <span className="text-sm font-normal text-destructive/80">Isu</span></div>
            <p className="text-xs text-destructive/80 mt-1">
              12 siswa alpha {'>'}5 hari, 8 tunggakan {'>'}2 bln
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kehadiran Terakhir</CardTitle>
            <CardDescription>Daftar siswa dengan ketidakhadiran (S/I/A) terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nama</th>
                    <th className="px-4 py-3 font-medium">Kelas</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">Budi Santoso</td>
                    <td className="px-4 py-3 text-muted-foreground">X-A</td>
                    <td className="px-4 py-3">
                      <span className="bg-destructive/10 text-destructive text-xs px-2 py-1 rounded-full font-medium">Alpha</span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">Hari ini</td>
                  </tr>
                  <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">Siti Aminah</td>
                    <td className="px-4 py-3 text-muted-foreground">XI-IPA-1</td>
                    <td className="px-4 py-3">
                      <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded-full font-medium">Sakit</span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">Hari ini</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Pembayaran</CardTitle>
            <CardDescription>Transaksi terakhir yang masuk ke sistem (SPP/Gedung/dll)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">No. Ref</th>
                    <th className="px-4 py-3 font-medium">Nama/Kelas</th>
                    <th className="px-4 py-3 font-medium">Jenis</th>
                    <th className="px-4 py-3 font-medium text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">INV-0128</td>
                    <td className="px-4 py-3 font-medium text-foreground">Budi Santoso (X-A)</td>
                    <td className="px-4 py-3 text-muted-foreground">SPP Agu</td>
                    <td className="px-4 py-3 text-right font-medium text-secondary">Rp 350.000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Statistik Kehadiran (Bulan Ini)</CardTitle>
            <CardDescription>Visualisasi tingkat kehadiran harian siswa</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-end justify-between px-4 pb-4">
            {[40, 60, 80, 50, 90, 75, 85].map((height, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className="w-10 bg-primary/20 hover:bg-primary transition-all duration-300 rounded-t-md"
                  style={{ height: `${height * 2}px` }}
                ></div>
                <span className="text-xs text-muted-foreground">{i + 1} Agu</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Pembayaran SPP</CardTitle>
            <CardDescription>Tingkat pelunasan SPP per tingkat kelas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Kelas X</span>
                <span className="text-muted-foreground">85% (120/140 lunas)</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[85%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Kelas XI</span>
                <span className="text-muted-foreground">72% (108/150 lunas)</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[72%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Kelas XII</span>
                <span className="text-muted-foreground">90% (144/160 lunas)</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[90%]"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
