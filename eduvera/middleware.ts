import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. all root files inside /public (e.g. favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. app.eduvera.id, tenant.eduvera.id, localhost:3000)
  const hostname = req.headers.get("host") || "eduvera.id";

  // Determine current environment root domain
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  // e.g. "tenant", "app", ""
  const subdomain = hostname.replace(`.${rootDomain}`, "");

  // Rewriting public root domain path
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    // Already matches landing page inside (landing)/page.tsx because it maps to "/"
    if (url.pathname === '/login') return NextResponse.rewrite(new URL('/login', req.url));
    if (url.pathname === '/') return NextResponse.rewrite(new URL('/', req.url));
    return NextResponse.next();
  }

  // Rewriting to App/Owner/Yayasan admin panel
  if (subdomain === "app") {
    // Superadmin Yayasan
    if (url.pathname.startsWith('/yayasan')) {
      return NextResponse.rewrite(new URL(`/yayasan-dashboard`, req.url));
    }
    // Owner SaaS
    if (url.pathname.startsWith('/owner')) {
      return NextResponse.rewrite(new URL(`/owner-dashboard`, req.url));
    }

    // Default app route -> login or owner dashboard
    return NextResponse.rewrite(new URL(`/login`, req.url));
  }

  // Rewrite to Tenant-specific app (Sekolah / Pesantren / Portal)
  // [tenant].eduvera.id
  if (subdomain && subdomain !== "app" && subdomain !== "www") {
    // Depending on user session context it would rewrite to sekolah, pesantren, or portal
    // For now we just route them dynamically by path suffix if provided, else fallback to sekolah
    if (url.pathname.startsWith('/siswa')) {
      return NextResponse.rewrite(new URL(`/siswa/siswa-dashboard`, req.url));
    }
    if (url.pathname.startsWith('/wali')) {
      return NextResponse.rewrite(new URL(`/wali/wali-dashboard`, req.url));
    }
    if (url.pathname.startsWith('/pesantren')) {
      return NextResponse.rewrite(new URL(url.pathname, req.url));
    }
    if (url.pathname.startsWith('/sekolah')) {
      return NextResponse.rewrite(new URL(url.pathname, req.url));
    }

    // Default fallback for tenant root
    return NextResponse.rewrite(new URL(`/sekolah/dashboard`, req.url));
  }

  return NextResponse.next();
}
