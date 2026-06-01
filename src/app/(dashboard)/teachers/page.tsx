export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import TeachersClient from "./client";
import type { ComponentProps } from "react";

export default async function TeachersPage() {
  const teachers = await db
    .select({
      id: employees.id,
      name: employees.name,
      nip: employees.nip,
      type: employees.type,
      position: employees.position,
      status: sql<'aktif' | 'nonaktif'>`${employees.status}`,
      phone: employees.phone,
      createdAt: employees.createdAt,
    })
    .from(employees)
    .where(and(eq(employees.type, "guru"), isNull(employees.deletedAt)))
    .orderBy(desc(employees.createdAt))
    .limit(500);

  const serializedTeachers: ComponentProps<typeof TeachersClient>["initialData"] = teachers.map((t) => ({
    ...t,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : null,
  }));

  return <TeachersClient initialData={serializedTeachers} />;
}
