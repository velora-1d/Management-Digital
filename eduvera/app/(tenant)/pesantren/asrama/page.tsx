import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Users, Home, BookOpen, Clock } from "lucide-react";

export default function AsramaTahfidzPesantren() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Asrama & Tahfidz</h1>
          <p className="text-muted-foreground mt-1">Kelola data kamar, daftar musyrif, dan rekap hafalan santri</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <BookOpen className="w-4 h-4" /> Cetak Buku Mutaba&apos;ah
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Tambah Asrama/Kamar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Asrama Putra</CardTitle>
            <Home className="w-4 h-4 text-primary absolute right-6 top-6" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Gedung</div>
            <p className="text-xs text-muted-foreground mt-1">20 Kamar | 180/200 Santri Terisi</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Asrama Putri</CardTitle>
            <Home className="w-4 h-4 text-secondary absolute right-6 top-6" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 Gedung</div>
            <p className="text-xs text-muted-foreground mt-1">15 Kamar | 105/120 Santri Terisi</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Musyrif/ah</CardTitle>
            <Users className="w-4 h-4 text-accent absolute right-6 top-6" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 Orang</div>
            <p className="text-xs text-muted-foreground mt-1">1 Musyrif/ah per ~15 Santri (Rasio Ideal)</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Progress Setoran Hari Ini</CardTitle>
            <Clock className="w-4 h-4 text-primary absolute right-6 top-6" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">240 Santri</div>
            <p className="text-xs text-primary/80 mt-1">75% dari total 320 santri mukim telah setor</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Daftar Kamar & Halaqah</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-4">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama gedung, kamar, atau musyrif..."
                className="pl-9 bg-muted/50"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Semua Asrama</option>
                <option value="putra">Gedung Abu Bakar (Putra)</option>
                <option value="putra2">Gedung Umar (Putra)</option>
                <option value="putri">Gedung Khadijah (Putri)</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Asrama / Kamar</th>
                  <th className="px-4 py-3 font-medium">Musyrif Pendamping</th>
                  <th className="px-4 py-3 font-medium">Kapasitas</th>
                  <th className="px-4 py-3 font-medium">Status Setoran Tahfidz (Hari Ini)</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-primary">Gedung Abu Bakar - Kamar 101</div>
                    <div className="text-xs text-muted-foreground">Kategori: SMP Putra</div>
                  </td>
                  <td className="px-4 py-3 font-medium">Ust. Zaid bin Tsabit</td>
                  <td className="px-4 py-3 font-medium">
                    12 <span className="text-muted-foreground font-normal">/ 12 Santri</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-secondary w-full"></div>
                      </div>
                      <span className="text-xs text-secondary font-medium">100% (12/12)</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="text-primary h-8">Lihat Detail</Button>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-primary">Gedung Khadijah - Kamar 205</div>
                    <div className="text-xs text-muted-foreground">Kategori: SMA Putri</div>
                  </td>
                  <td className="px-4 py-3 font-medium">Ustadzah Maryam</td>
                  <td className="px-4 py-3 font-medium">
                    10 <span className="text-muted-foreground font-normal">/ 12 Santri</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[70%]"></div>
                      </div>
                      <span className="text-xs font-medium">70% (7/10)</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="text-primary h-8">Lihat Detail</Button>
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
