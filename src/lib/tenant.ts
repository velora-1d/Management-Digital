import { headers } from "next/headers";

export interface TenantInfo {
  id: number;
  name: string;
  slug: string;
  domain: string | null;
  status: string;
  plan: string;
  settings: Record<string, unknown>;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export const DEFAULT_TENANT: TenantInfo = {
  id: 1,
  name: "Santrix Demo School",
  slug: "demo",
  domain: "demo.santrix.my.id",
  status: "aktif",
  plan: "standard",
  settings: {},
};

/**
 * Ekstrak subdomain dari hostname.
 * Contoh:
 * - sekolah1.santrix.my.id -> sekolah1
 * - demo.santrix.my.id -> demo
 * - localhost / IP -> demo
 */
export function getTenantFromHost(host: string | null | undefined): string {
  if (!host) return "demo";

  // Hilangkan port jika ada (contoh: localhost:3002 -> localhost)
  const cleanHost = host.split(":")[0].trim().toLowerCase();

  // Jika IP address atau localhost, gunakan tenant default 'demo'
  if (
    cleanHost === "localhost" ||
    cleanHost === "127.0.0.1" ||
    cleanHost === "::1" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(cleanHost)
  ) {
    return "demo";
  }

  // Dukungan lokal development *.localhost (contoh: sekolah1.localhost)
  if (cleanHost.endsWith(".localhost")) {
    const sub = cleanHost.replace(/\.localhost$/, "");
    return sub && sub !== "www" ? sub : "demo";
  }

  // Cek root domain terdaftar (default: santrix.my.id atau via ROOT_DOMAIN env)
  const rootDomain = (process.env.ROOT_DOMAIN || "santrix.my.id").toLowerCase().trim();

  // Host persis root domain atau www.rootDomain -> demo
  if (cleanHost === rootDomain || cleanHost === `www.${rootDomain}`) {
    return "demo";
  }

  // Subdomain di bawah root domain (contoh: sekolah1.santrix.my.id)
  if (cleanHost.endsWith(`.${rootDomain}`)) {
    const sub = cleanHost.slice(0, -(rootDomain.length + 1));
    return sub && sub !== "www" ? sub : "demo";
  }

  // Penanganan domain umum dengan ccTLD (.co.id, .sch.id, .my.id, dsb)
  const parts = cleanHost.split(".");
  const twoPartTlds = ["co.id", "sch.id", "my.id", "or.id", "ac.id", "web.id", "go.id"];
  const isTwoPartTld = twoPartTlds.some((tld) => cleanHost.endsWith(`.${tld}`));

  if (isTwoPartTld) {
    if (parts.length > 3) {
      const sub = parts[0];
      return sub && sub !== "www" ? sub : "demo";
    }
    return "demo";
  }

  // Subdomain domain standar (contoh: sekolah1.contoh.com)
  if (parts.length > 2) {
    const sub = parts[0];
    return sub && sub !== "www" ? sub : "demo";
  }

  return "demo";
}

// In-memory cache untuk tenant yang telah di-resolve (TTL 60 detik)
const tenantMemoryCache = new Map<string, { data: TenantInfo; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000;

/**
 * Query data tenant dari tabel tenants berdasarkan slug atau domain.
 * Memiliki cache in-memory dan fallback ke tenant ID 1 jika gagal atau offline.
 */
export async function resolveTenant(slugOrDomain: string): Promise<TenantInfo> {
  const query = (slugOrDomain || "demo").trim().toLowerCase();

  const cached = tenantMemoryCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const { db } = await import("@/db");
    const { tenants } = await import("@/db/schema");
    const { eq, or } = await import("drizzle-orm");

    const isNumericId = !isNaN(Number(query)) && !query.includes(".");

    const conditions = [eq(tenants.slug, query), eq(tenants.domain, query)];
    if (isNumericId) {
      conditions.push(eq(tenants.id, parseInt(query, 10)));
    }

    const rows = await db
      .select()
      .from(tenants)
      .where(or(...conditions))
      .limit(1);

    if (rows && rows.length > 0) {
      const record = rows[0];
      const tenant: TenantInfo = {
        id: record.id,
        name: record.name,
        slug: record.slug,
        domain: record.domain ?? null,
        status: record.status,
        plan: record.plan,
        settings: (record.settings as Record<string, unknown>) || {},
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };

      tenantMemoryCache.set(query, { data: tenant, timestamp: Date.now() });
      tenantMemoryCache.set(tenant.slug, { data: tenant, timestamp: Date.now() });
      tenantMemoryCache.set(String(tenant.id), { data: tenant, timestamp: Date.now() });
      if (tenant.domain) {
        tenantMemoryCache.set(tenant.domain, { data: tenant, timestamp: Date.now() });
      }

      return tenant;
    }
  } catch (error) {
    console.warn("Gagal resolve tenant dari database, fallback ke default:", error);
  }

  return DEFAULT_TENANT;
}

/**
 * Mengambil informasi tenant dari request headers (Next.js server components / API routes).
 */
export async function getTenantContext(): Promise<{
  tenantId: number;
  tenantSlug: string;
  tenant: TenantInfo;
}> {
  try {
    const headerList = await headers();
    const slugHeader = headerList.get("x-tenant-slug");
    const idHeader = headerList.get("x-tenant-id");

    if (slugHeader) {
      const tenant = await resolveTenant(slugHeader);
      const parsedId = idHeader ? parseInt(idHeader, 10) : tenant.id;
      return {
        tenantId: isNaN(parsedId) ? tenant.id : parsedId,
        tenantSlug: tenant.slug || slugHeader,
        tenant,
      };
    }

    const host = headerList.get("host") || headerList.get("x-forwarded-host");
    const slug = getTenantFromHost(host);
    const tenant = await resolveTenant(slug);

    return {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenant,
    };
  } catch (err) {
    console.warn("Gagal membaca header context, fallback ke default tenant:", err);
    return {
      tenantId: DEFAULT_TENANT.id,
      tenantSlug: DEFAULT_TENANT.slug,
      tenant: DEFAULT_TENANT,
    };
  }
}
