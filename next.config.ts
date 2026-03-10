import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimasi performa untuk serverless (Vercel)
  
  // Menggunakan output standalone untuk bundle yang lebih kecil
  // (mengurangi cold start karena ukuran deployment lebih kecil)
  output: "standalone",

  // Optimasi gambar
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Header caching untuk aset statis
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
