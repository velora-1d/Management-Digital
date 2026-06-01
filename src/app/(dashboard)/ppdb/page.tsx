export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { classrooms, cashAccounts } from "@/db/schema";
import { isNull, and, eq, or, desc, inArray, sql, asc } from "drizzle-orm";
import { ppdbRegistrations, registrationPayments } from "@/db/schema";
import PpdbClient, { Gender, RegistrationStatus, PpdbQueryResult } from "./client";

interface RegistrationPaymentItem {
  id: number;
  paymentType: string;
  payableId: number | null;
  nominal: number;
  isPaid: boolean;
}

const getPpdbReferenceData = async () => {
  return await Promise.all([
    db
      .select({ id: classrooms.id, name: classrooms.name, level: classrooms.level })
      .from(classrooms)
      .where(isNull(classrooms.deletedAt))
      .orderBy(asc(classrooms.name))
      .limit(200),
    db
      .select({ id: cashAccounts.id, name: cashAccounts.name, balance: cashAccounts.balance })
      .from(cashAccounts)
      .where(isNull(cashAccounts.deletedAt))
      .orderBy(asc(cashAccounts.name))
      .limit(50),
  ]);
};

const getInitialRegistrations = async () => {
  const limit = 20;
  const conditions = [isNull(ppdbRegistrations.deletedAt)];
  
  const [list, [{ total }]] = await Promise.all([
    db.select({
      id: ppdbRegistrations.id,
      formNo: ppdbRegistrations.formNo,
      name: ppdbRegistrations.name,
      gender: ppdbRegistrations.gender,
      phone: ppdbRegistrations.phone,
      status: ppdbRegistrations.status,
      targetClassroom: ppdbRegistrations.targetClassroom,
      createdAt: ppdbRegistrations.createdAt,
    })
    .from(ppdbRegistrations)
    .where(and(...conditions))
    .orderBy(desc(ppdbRegistrations.createdAt))
    .limit(limit)
    .offset(0),
    db.select({ total: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(and(...conditions)),
  ]);

  const regIds = list.map(r => r.id);
  let payments: RegistrationPaymentItem[] = [];
  if (regIds.length > 0) {
    payments = await db.select({
      id: registrationPayments.id,
      paymentType: registrationPayments.paymentType,
      payableId: registrationPayments.payableId,
      nominal: registrationPayments.nominal,
      isPaid: registrationPayments.isPaid,
    })
    .from(registrationPayments)
    .where(and(eq(registrationPayments.payableType, "ppdb"), inArray(registrationPayments.payableId, regIds), isNull(registrationPayments.deletedAt)));
  }

  const dataWithPayments = list.map(r => ({ 
    ...r, 
    gender: r.gender as Gender,
    status: r.status as RegistrationStatus,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
    payments: payments
      .filter(p => p.payableId === r.id)
      .map(p => ({ ...p, payableId: p.payableId as number })) 
  }));
  
  const [{ pending }, { diterima }, { ditolak }, { totalAll }] = await Promise.all([
    db.select({ pending: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(and(isNull(ppdbRegistrations.deletedAt), or(eq(ppdbRegistrations.status, "menunggu" as string), eq(ppdbRegistrations.status, "pending" as string)))).then(r => r[0]),
    db.select({ diterima: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(and(isNull(ppdbRegistrations.deletedAt), eq(ppdbRegistrations.status, "diterima" as string))).then(r => r[0]),
    db.select({ ditolak: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(and(isNull(ppdbRegistrations.deletedAt), eq(ppdbRegistrations.status, "ditolak" as string))).then(r => r[0]),
    db.select({ totalAll: sql<number>`count(*)`.mapWith(Number) }).from(ppdbRegistrations).where(isNull(ppdbRegistrations.deletedAt)).then(r => r[0]),
  ]);

  return {
    data: dataWithPayments,
    stats: { total: totalAll, pending, diterima, ditolak },
    pagination: { page: 1, limit, total, totalPages: Math.ceil(total / limit) }
  } as PpdbQueryResult;
};

export default async function PpdbPage() {
  const [[allClassrooms, allCashAccounts], initialResult] = await Promise.all([
    getPpdbReferenceData(),
    getInitialRegistrations(),
  ]);

  return (
    <PpdbClient
      initialClassrooms={allClassrooms}
      initialCashAccounts={allCashAccounts}
      initialResult={initialResult}
    />
  );
}
