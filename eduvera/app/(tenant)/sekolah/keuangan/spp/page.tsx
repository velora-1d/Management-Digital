import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download, MoreHorizontal, CheckCircle2, AlertCircle } from "lucide-react";

export default function PembayaranSPP() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pembayaran SPP</h1>
          <p className="text-muted-foreground mt-1">Kelola tagihan dan penerimaan SPP siswa per bulan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Cetak Rekap
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Input Pembayaran Manual
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Target SPP Bulan Ini (Agustus)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Rp 157.500.000</div>
            <p className="text-xs text-primary/80 mt-1">450 Siswa Aktif x Rp 350.000</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Sudah Dibayar (Lunas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">Rp 122.500.000</div>
            <p className="text-xs text-secondary/80 mt-1">350 Siswa (78%)</p>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Belum Dibayar (Tunggakan)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">Rp 35.000.000</div>
            <p className="text-xs text-destructive/80 mt-1">100 Siswa (22%)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari NIS, NISN, atau Nama Siswa..."
                className="pl-9 bg-muted/50"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Bulan: Agustus 2026</option>
                <option value="jul">Juli 2026</option>
                <option value="sep">September 2026</option>
              </select>
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Semua Status</option>
                <option value="lunas">Lunas</option>
                <option value="belum">Belum Lunas</option>
              </select>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Siswa</th>
                  <th className="px-4 py-3 font-medium">Kelas</th>
                  <th className="px-4 py-3 font-medium">Tagihan</th>
                  <th className="px-4 py-3 font-medium">Metode</th>
                  <th className="px-4 py-3 font-medium">Status SPP Agustus</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-primary">Ahmad Fauzi</div>
                    <div className="text-xs text-muted-foreground">NIS: 230101</div>
                  </td>
                  <td className="px-4 py-3 font-medium">X-A</td>
                  <td className="px-4 py-3 font-medium">Rp 350.000</td>
                  <td className="px-4 py-3 text-muted-foreground">Transfer Bank</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-secondary">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium">Lunas</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">05 Agu 2026, 09:15</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="text-primary h-8">Cetak Bukti</Button>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/30 transition-colors bg-destructive/5">
                  <td className="px-4 py-3">
                    <div className="font-medium text-primary">Budi Santoso</div>
                    <div className="text-xs text-muted-foreground">NIS: 230103</div>
                  </td>
                  <td className="px-4 py-3 font-medium">XII-IPS-2</td>
                  <td className="px-4 py-3 font-medium">Rp 350.000</td>
                  <td className="px-4 py-3 text-muted-foreground">-</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Belum Bayar</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8">Kirim WA</Button>
                    <Button size="sm" className="h-8">Bayar</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
