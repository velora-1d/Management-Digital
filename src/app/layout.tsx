import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Management Digital | Sekolah Global Nusantara",
  description: "Sistem Informasi Terintegrasi Sekolah Global Nusantara",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${outfit.variable} antialiased text-gray-800 min-h-screen`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
