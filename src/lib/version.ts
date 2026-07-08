import fs from "fs";
import path from "path";

/**
 * Mendapatkan build ID dari server Next.js.
 * Pada mode production, Next.js menyimpan ID build unik di file `.next/BUILD_ID`.
 * Pada mode development, kita fallback ke string "development".
 */
export function getBuildId(): string {
  try {
    const buildIdPath = path.join(process.cwd(), ".next/BUILD_ID");
    if (fs.existsSync(buildIdPath)) {
      return fs.readFileSync(buildIdPath, "utf-8").trim();
    }
  } catch {
    // Gagal membaca file build ID (misal karena permission atau file tidak ditemukan di mode dev)
  }
  return "development";
}

/**
 * PANDUAN DEPLOYMENT TERKAIT SERVER ACTIONS & BUNDLE MISMATCH:
 * 
 * Masalah: Saat deployment baru dirilis, Next.js menghasilkan hash Server Action baru.
 * User yang sedang membuka web menggunakan bundle lama (hash lama), sehingga memicu 
 * "Failed to find Server Action" ketika mengeksekusi action.
 * 
 * Strategi Deployment yang Direkomendasikan:
 * 1. Overlapping Builds / Grace Period (Rolling Restarts):
 *    Jangan langsung mematikan instance server lama seketika. Berikan jeda waktu (grace period) 
 *    sekitar 5-10 menit di mana traffic didistribusikan secara bertahap (canary/rolling update). 
 *    Selama masa transisi, pastikan router/load-balancer mendukung 'Session Affinity' (sticky sessions) 
 *    sehingga user yang aktif tetap mengarah ke instance server lama yang sesuai dengan bundle-nya.
 * 2. Static Asset Hosting (CDN):
 *    Simpan static assets (js, css, chunks) dari build lama di CDN/storage (misal S3) dan jangan 
 *    langsung menghapusnya saat build baru dideploy. Ini mencegah ChunkLoadError bagi user yang sedang aktif.
 * 3. Healthcheck & Traffic Routing:
 *    Gunakan container orchestration (seperti Kubernetes atau Docker Swarm) dengan rolling update. 
 *    Biarkan server lama memproses request yang berjalan sampai habis (graceful shutdown) sebelum dimatikan.
 */

