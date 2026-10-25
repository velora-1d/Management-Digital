import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Providers } from "./providers";
import { getBuildId } from "@/lib/version";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Management Digital | Velora",
  description: "Sistem Informasi Terintegrasi Velora",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const buildId = getBuildId();

  return (
    <html lang="id">
      <head>
        <meta name="next-build-id" content={buildId} />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-slate-50 text-slate-800 min-h-screen`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
