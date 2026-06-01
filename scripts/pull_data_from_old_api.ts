import * as dotenv from 'dotenv';
import { Client } from 'pg';

// Load from .env.local
dotenv.config({ path: '.env.local' });

const OLD_API_BASE = 'https://assaodah.santrix.my.id/api';

async function pullData() {
  const URL = process.env.DATABASE_URL;
  if (!URL) throw new Error("DATABASE_URL tidak ditemukan");

  const client = new Client({
    connectionString: URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("🚀 Memulai proses 'Tarik Data' dari website lama...");

    // 1. Migrasi Berita (Posts)
    console.log("📰 Menarik data Berita...");
    const postsRes = await fetch(`${OLD_API_BASE}/web/posts`);
    const posts = await postsRes.json();
    for (const post of (posts.data || [])) {
      try {
        await client.query(
          `INSERT INTO web_posts (title, slug, excerpt, content, thumbnail_url, category, status, published_at, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (slug) DO NOTHING`,
          [post.title, post.slug, post.excerpt, post.content, post.thumbnail_url, post.category, 'published', post.published_at, post.created_at, post.updated_at]
        );
      } catch {
        console.error(`Gagal insert post: ${post.title}`);
      }
    }

    // 2. Migrasi Guru (Teachers)
    console.log("👨‍🏫 Menarik data Guru...");
    const teachersRes = await fetch(`${OLD_API_BASE}/web/teachers`);
    const teachers = await teachersRes.json();
    for (const teacher of (teachers.data || [])) {
      try {
        await client.query(
          `INSERT INTO web_teachers (name, position, bio, photo_url, "order", status) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [teacher.name, teacher.position, teacher.bio, teacher.photo_url, teacher.order || 0, 'aktif']
        );
      } catch {
        console.error(`Gagal insert teacher: ${teacher.name}`);
      }
    }

    // 3. Migrasi Fasilitas (Facilities)
    console.log("🏫 Menarik data Fasilitas...");
    const facilitiesRes = await fetch(`${OLD_API_BASE}/web/facilities`);
    const facilities = await facilitiesRes.json();
    for (const item of (facilities.data || [])) {
      try {
        await client.query(
          `INSERT INTO web_facilities (name, description, image_url, icon_svg, "order") 
           VALUES ($1, $2, $3, $4, $5)`,
          [item.name, item.description, item.image_url, item.icon_svg, item.order || 0]
        );
      } catch {
        console.error(`Gagal insert facility: ${item.name}`);
      }
    }

    // 4. Migrasi Prestasi (Achievements)
    console.log("🏆 Menarik data Prestasi...");
    const achievementsRes = await fetch(`${OLD_API_BASE}/web/achievements`);
    const achievements = await achievementsRes.json();
    for (const item of (achievements.data || [])) {
      try {
        await client.query(
          `INSERT INTO web_achievements (title, student_name, competition_name, level, year, image_url) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [item.title, item.student_name, item.competition_name, item.level, item.year, item.image_url]
        );
      } catch {
        console.error(`Gagal insert achievement: ${item.title}`);
      }
    }

    // 5. Migrasi Settings
    console.log("⚙️ Menarik data Settings...");
    const settingsRes = await fetch(`${OLD_API_BASE}/web/settings`);
    const settings = await settingsRes.json();
    for (const [key, value] of Object.entries(settings.data || {})) {
      try {
        await client.query(
          `INSERT INTO web_settings ("key", "value", "group") 
           VALUES ($1, $2, $3)
           ON CONFLICT ("key") DO UPDATE SET "value" = $2`,
          [key, String(value), 'umum']
        );
      } catch {
        console.error(`Gagal insert setting: ${key}`);
      }
    }

    console.log("\n✨ Semua data telah berhasil ditarik ke database ERP!");
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Terjadi kesalahan:", err.message);
    }
  } finally {
    await client.end();
  }
}

pullData();
