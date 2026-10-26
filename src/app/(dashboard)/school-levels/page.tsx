export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { schoolLevels } from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { getTenantContext } from "@/lib/tenant";
import SchoolLevelsClient, { SchoolLevelItem } from "./client";

export default async function SchoolLevelsPage() {
  const { tenantId } = await getTenantContext();

  const levels = await db
    .select({
      id: schoolLevels.id,
      code: schoolLevels.code,
      name: schoolLevels.name,
      orderNumber: schoolLevels.orderNumber,
      isActive: schoolLevels.isActive,
      hasPin: sql<boolean>`CASE WHEN ${schoolLevels.pin} IS NOT NULL AND ${schoolLevels.pin} != '' THEN true ELSE false END`,
      class_rooms_count: sql<number>`(
        SELECT count(*) FROM classrooms c 
        WHERE c.school_level_id = ${schoolLevels.id} AND c.deleted_at IS NULL
      )`.mapWith(Number),
      students_count: sql<number>`(
        SELECT count(*) FROM students s 
        WHERE s.school_level_id = ${schoolLevels.id} AND s.deleted_at IS NULL AND s.status = 'aktif'
      )`.mapWith(Number),
    })
    .from(schoolLevels)
    .where(eq(schoolLevels.tenantId, tenantId))
    .orderBy(asc(schoolLevels.orderNumber), asc(schoolLevels.id));

  return <SchoolLevelsClient initialLevels={levels as SchoolLevelItem[]} />;
}
