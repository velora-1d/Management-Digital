"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Email atau password salah");
        setLoading(false);
      } else {
        router.push("/sekolah/dashboard"); // For demo, default fallback route. Middleware will handle subdomain redirects.
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Coba lagi.");
      setLoading(false);
    }
  };

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
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md font-medium text-center border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nama@sekolah.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Lupa password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button className="w-full mt-4" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
            <div className="text-center mt-6 text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link href="/daftar" className="text-primary hover:underline">
                Daftar gratis 14 hari
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <Link href="/" className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors">
        &larr; Kembali ke Beranda
      </Link>
    </div>
  );
}
