import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center text-2xl">
              EV
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Masuk ke EduVera</CardTitle>
          <CardDescription>
            Masukkan email dan password Anda untuk masuk ke sistem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" placeholder="nama@sekolah.sch.id" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                Password
              </label>
              <Link href="#" className="text-sm text-primary hover:underline">
                Lupa password?
              </Link>
            </div>
            <Input id="password" type="password" />
          </div>
          <Button className="w-full mt-4">Masuk</Button>
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/daftar" className="text-primary hover:underline">
              Daftar gratis 14 hari
            </Link>
          </div>
        </CardContent>
      </Card>
      <Link href="/" className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors">
        &larr; Kembali ke Beranda
      </Link>
    </div>
  );
}
