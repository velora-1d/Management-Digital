export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import StaffClient from "./client";

export default async function StaffPage() {
  const staff = await db
    .select({
      id: employees.id,
      name: employees.name,
      nip: employees.nip,
      position: employees.position,
      status: employees.status,
      phone: employees.phone,
    })
    .from(employees)
    .where(and(eq(employees.type, "staf"), isNull(employees.deletedAt)))
    .orderBy(desc(employees.createdAt))
    .limit(500);

  const serialized = staff.map(s => ({ ...s, status: s.status as 'aktif' | 'nonaktif' }));

  return <StaffClient initialData={serialized} />;
}
