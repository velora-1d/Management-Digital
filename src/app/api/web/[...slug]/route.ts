import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { 
  webPosts, 
  webHeroes, 
  webFacilities, 
  employees, 
  webAchievements, 
  webPrograms,
  webStats,
  webSettings
} from "@/db/schema";
import { eq, desc, and, isNull, asc } from "drizzle-orm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan server";
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug;
  const resource = path[0];
  const subResource = path[1];

  try {
    // 1. POSTS
    if (resource === "posts") {
      if (subResource) {
        // Single Post by Slug
        const post = await db.query.webPosts.findFirst({
          where: and(eq(webPosts.slug, subResource), eq(webPosts.status, "published")),
        });
        if (!post) return NextResponse.json({ success: false, message: "Berita tidak ditemukan" }, { status: 404, headers: corsHeaders });
        return NextResponse.json({ success: true, data: post }, { headers: corsHeaders });
      } else {
        // All Published Posts
        const posts = await db.query.webPosts.findMany({
          where: eq(webPosts.status, "published"),
          orderBy: [desc(webPosts.publishedAt)],
        });
        return NextResponse.json({ success: true, data: posts }, { headers: corsHeaders });
      }
    }

    // 2. HEROES
    if (resource === "heroes") {
      const heroes = await db.query.webHeroes.findMany({
        where: eq(webHeroes.status, "aktif"),
        orderBy: [webHeroes.order],
      });
      return NextResponse.json({ success: true, data: heroes }, { headers: corsHeaders });
    }

    // 3. TEACHERS
    if (resource === "teachers") {
      const teachersData = await db.query.employees.findMany({
          where: and(
              eq(employees.type, 'guru'),
              eq(employees.status, 'aktif'),
              isNull(employees.deletedAt)
          ),
          orderBy: [asc(employees.order), asc(employees.name)],
      });
      
      // Map to match the expected frontend format
      const formattedTeachers = teachersData.map(t => ({
          id: t.id,
          name: t.name,
          position: t.position,
          bio: t.bio || '',
          photoUrl: t.photoUrl,
          order: t.order || 1,
          status: t.status
      }));

      return NextResponse.json({ success: true, data: formattedTeachers }, { headers: corsHeaders });
    }

    // 4. FACILITIES (Features)
    if (resource === "facilities" || resource === "features") {
      const facilities = await db.query.webFacilities.findMany({
        orderBy: [webFacilities.order],
      });
      return NextResponse.json({ success: true, data: facilities }, { headers: corsHeaders });
    }

    // 5. ACHIEVEMENTS
    if (resource === "achievements") {
      const achievements = await db.query.webAchievements.findMany({
        orderBy: [desc(webAchievements.year)],
      });
      return NextResponse.json({ success: true, data: achievements }, { headers: corsHeaders });
    }

    // 6. PROGRAMS
    if (resource === "programs") {
      const programs = await db.query.webPrograms.findMany({
        where: eq(webPrograms.status, "aktif"),
        orderBy: [webPrograms.order],
      });
      return NextResponse.json({ success: true, data: programs }, { headers: corsHeaders });
    }

    // 7. STATS
    if (resource === "stats") {
      const stats = await db.query.webStats.findMany({
        where: eq(webStats.status, "aktif"),
        orderBy: [webStats.order],
      });
      return NextResponse.json({ success: true, data: stats }, { headers: corsHeaders });
    }

    // 8. PPDB INFO
    if (resource === "ppdb" && subResource === "info") {
      const settings = await db.query.webSettings.findMany({
        where: eq(webSettings.group, "ppdb"),
      });
      
      const ppdbInfo = settings.reduce<Record<string, string>>((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      // Add default or transform values if needed
      return NextResponse.json({ 
        success: true, 
        data: {
          year: ppdbInfo.ppdb_year || "2024/2025",
          is_open: ppdbInfo.ppdb_status === "buka",
          quota: parseInt(ppdbInfo.ppdb_quota || "0"),
          registered: parseInt(ppdbInfo.ppdb_registered || "0"),
          start_date: ppdbInfo.ppdb_start_date || "-",
          end_date: ppdbInfo.ppdb_end_date || "-",
          fee: ppdbInfo.ppdb_fee || "Gratis",
          whatsapp: ppdbInfo.ppdb_whatsapp || "",
          banner_url: ppdbInfo.ppdb_banner_url || ""
        } 
      }, { headers: corsHeaders });
    }

    // 9. SETTINGS
    if (resource === "settings") {
      const settings = await db.query.webSettings.findMany();
      // Transform into object key-value
      const settingsObj = settings.reduce<Record<string, string>>((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      return NextResponse.json({ success: true, data: settingsObj }, { headers: corsHeaders });
    }

    return NextResponse.json({ success: false, message: "Resource not found" }, { status: 404, headers: corsHeaders });
  } catch (error: unknown) {
    console.error(`[API web/${resource}] Error:`, error);
    return NextResponse.json({ success: false, message: getErrorMessage(error) }, { status: 500, headers: corsHeaders });
  }
}
