import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardWali() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portal Wali Murid</h1>
          <p className="text-muted-foreground mt-1">Bapak/Ibu Orang Tua dari Budi Santoso</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <User className="w-4 h-4" /> Ganti Profil Anak
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Perkembangan Anak (Budi Santoso - X-A)</CardTitle>
            <CardDescription>Grafik akademik dan kehadiran bulanan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Persentase Kehadiran</p>
                <p className="text-2xl font-bold mt-1">95%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Izin/Sakit</p>
                <p className="text-2xl font-bold mt-1 text-accent">3 Hari</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alpha</p>
                <p className="text-2xl font-bold mt-1 text-destructive">1 Hari</p>
              </div>
            </div>

            <div className="h-40 bg-muted/20 border border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
              <Activity className="w-5 h-5 mr-2" />
              [Grafik Nilai Rata-rata per Mata Pelajaran]
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Tagihan</CardTitle>
            <CardDescription>Status keuangan dan pembayaran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium mb-1">Tagihan Belum Lunas</p>
              <p className="text-2xl font-bold text-destructive">Rp 350.000</p>
              <p className="text-xs text-destructive/80 mt-1">SPP Bulan Agustus</p>
              <Button size="sm" variant="destructive" className="w-full mt-3">
                Bayar Sekarang
              </Button>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-3">Riwayat Pembayaran</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">SPP Juli</p>
                    <p className="text-xs text-muted-foreground">10 Jul 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Rp 350.000</p>
                    <span className="text-xs text-secondary font-medium">Berhasil</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">Daftar Ulang</p>
                    <p className="text-xs text-muted-foreground">25 Jun 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Rp 2.500.000</p>
                    <span className="text-xs text-secondary font-medium">Berhasil</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
