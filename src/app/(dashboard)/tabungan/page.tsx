export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { classrooms } from "@/db/schema";
import { isNull, asc } from "drizzle-orm";
import TabunganClient from "./client";

export default async function TabunganPage() {
  const allClassrooms = await db
    .select({ id: classrooms.id, name: classrooms.name })
    .from(classrooms)
    .where(isNull(classrooms.deletedAt))
    .orderBy(asc(classrooms.name))
    .limit(100);

  return <TabunganClient initialClassrooms={allClassrooms} />;
}
