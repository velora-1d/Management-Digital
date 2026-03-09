import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, Users, TrendingUp, AlertCircle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardOwner() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Panel - EduVera</h1>
          <p className="text-muted-foreground mt-1">SaaS Administration Dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Database className="w-4 h-4" /> System Health
          </Button>
          <Button className="gap-2">
            <Building className="w-4 h-4" /> + Tambah Tenant
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Tenant Aktif</CardTitle>
            <Building className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground mt-1">
              +5 bulan ini (3 Trial, 45 Berbayar)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Pengguna (Users)</CardTitle>
            <Users className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450</div>
            <p className="text-xs text-muted-foreground mt-1">
              Akun lintas seluruh platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Monthly Recurring Rev.</CardTitle>
            <TrendingUp className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">Rp 85.5M</div>
            <p className="text-xs text-muted-foreground mt-1">
              ↑ 12% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-accent">Perlu Tindakan</CardTitle>
            <AlertCircle className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">3</div>
            <p className="text-xs text-accent mt-1 font-medium">
              Aktivasi Manual & Tiket Bantuan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daftar Tenant Terbaru</CardTitle>
            <CardDescription>Institusi yang baru saja mendaftar ke EduVera</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Institusi</th>
                    <th className="px-4 py-3 font-medium">Subdomain</th>
                    <th className="px-4 py-3 font-medium">Tipe</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">SDIT Nurul Fikri</td>
                    <td className="px-4 py-3 text-muted-foreground">nurulfikri</td>
                    <td className="px-4 py-3">Sekolah</td>
                    <td className="px-4 py-3">
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">Trial (12 hari)</span>
                    </td>
                  </tr>
                  <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">Pondok Pesantren Gontor</td>
                    <td className="px-4 py-3 text-muted-foreground">gontor</td>
                    <td className="px-4 py-3">Pesantren</td>
                    <td className="px-4 py-3">
                      <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full font-medium">Pro</span>
                    </td>
                  </tr>
                  <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">Yayasan Al-Azhar</td>
                    <td className="px-4 py-3 text-muted-foreground">alazhar</td>
                    <td className="px-4 py-3">Hybrid</td>
                    <td className="px-4 py-3">
                      <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full font-medium">Enterprise</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Overview</CardTitle>
            <CardDescription>Distribusi paket langganan aktif</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">Trial</span>
                <span className="font-bold">3 Tenant</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[10%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">Basic Plan</span>
                <span className="font-bold">25 Tenant</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[55%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">Pro Plan</span>
                <span className="font-bold">15 Tenant</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[30%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">Enterprise</span>
                <span className="font-bold">5 Tenant</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-foreground w-[15%]"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
