import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Calendar, Award } from "lucide-react";

export default function DashboardSiswa() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portal Siswa</h1>
          <p className="text-muted-foreground mt-1">Halo Budi Santoso (X-A). Selamat belajar!</p>
        </div>
        <div className="text-sm font-medium bg-muted px-4 py-2 rounded-lg border border-border">
          Semester Ganjil 2026/2027
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tugas Mendatang</CardTitle>
            <BookOpen className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 <span className="text-sm font-normal text-muted-foreground">Tugas</span></div>
            <p className="text-xs text-accent mt-1">
              Batas waktu terdekat besok
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Kehadiran (Semester)</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Alpha: 1 | Izin: 2 | Sakit: 0
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Nilai Rata-rata</CardTitle>
            <Award className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86.5</div>
            <p className="text-xs text-secondary mt-1 font-medium">
              Baik Sekali
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Jadwal Hari Ini</CardTitle>
            <CardDescription>Jadwal pelajaran yang harus kamu ikuti hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center w-16 bg-muted rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground">
                  07:30<br/>09:00
                </div>
                <div className="flex-1 border-l-2 border-primary pl-4">
                  <p className="font-bold text-foreground">Matematika Wajib</p>
                  <p className="text-sm text-muted-foreground">Bpk. Sudarsono | Ruang X-A</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center w-16 bg-muted rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground">
                  09:00<br/>10:30
                </div>
                <div className="flex-1 border-l-2 border-secondary pl-4">
                  <p className="font-bold text-foreground">Biologi</p>
                  <p className="text-sm text-muted-foreground">Ibu Rini | Laboratorium IPA</p>
                </div>
              </div>

              <div className="flex gap-4 opacity-50">
                <div className="flex flex-col items-center justify-center w-16 bg-muted rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground">
                  10:30<br/>11:00
                </div>
                <div className="flex-1 border-l-2 border-muted-foreground pl-4">
                  <p className="font-bold text-foreground">Istirahat Pertama</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center w-16 bg-muted rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground">
                  11:00<br/>12:30
                </div>
                <div className="flex-1 border-l-2 border-accent pl-4">
                  <p className="font-bold text-foreground">Pendidikan Agama Islam</p>
                  <p className="text-sm text-muted-foreground">Ustadz Hasan | Ruang X-A</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
