// d:\Mahin Project\ERP-Sekolah\next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  serverExternalPackages: ["pg", "jsonwebtoken", "bcryptjs"],

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
