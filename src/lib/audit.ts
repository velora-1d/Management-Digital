import { db } from "@/db";
import { auditLogs } from "@/db/schema";

/**
 * Audit Log Helper
 * 
 * Tulis log audit untuk setiap operasi CRUD kritis.
 * Log: userId, action, modelType, modelId, oldValues, newValues
 * 
 * Penggunaan:
 *   import { writeAuditLog } from "@/lib/audit";
 *   await writeAuditLog({
 *     userId: user.userId,
 *     action: "create",
 *     modelType: "Student",
 *     modelId: "123",
 *     newValues: { name: "Ahmad" },
 *   });
 */

interface AuditLogInput {
  userId: number | null;
  action: string;           // "create" | "update" | "delete" | "void" | "approve" | "reject" | "convert" | "toggle"
  modelType: string;        // "Student" | "InfaqBill" | "GeneralTransaction" | etc
  modelId: string;          // ID entitas yang di-audit
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
}

export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: input.userId,
      action: input.action,
      modelType: input.modelType,
      modelId: String(input.modelId),
      oldValues: input.oldValues ? JSON.stringify(input.oldValues) : "",
      newValues: input.newValues ? JSON.stringify(input.newValues) : "",
    });
  } catch (error) {
    // Audit log TIDAK boleh menggagalkan operasi utama
    // Jika gagal tulis log, cukup console.error
    console.error("[AuditLog] Gagal menulis audit log:", error);
  }
}

/**
 * Shorthand: audit untuk operasi CRUD umum
 */
export const audit = {
  create: (userId: number | null, modelType: string, modelId: string, newValues?: Record<string, any>) =>
    writeAuditLog({ userId, action: "create", modelType, modelId, newValues }),

  update: (userId: number | null, modelType: string, modelId: string, oldValues?: Record<string, any>, newValues?: Record<string, any>) =>
    writeAuditLog({ userId, action: "update", modelType, modelId, oldValues, newValues }),

  delete: (userId: number | null, modelType: string, modelId: string, oldValues?: Record<string, any>) =>
    writeAuditLog({ userId, action: "delete", modelType, modelId, oldValues }),

  void: (userId: number | null, modelType: string, modelId: string) =>
    writeAuditLog({ userId, action: "void", modelType, modelId }),

  approve: (userId: number | null, modelType: string, modelId: string) =>
    writeAuditLog({ userId, action: "approve", modelType, modelId }),

  reject: (userId: number | null, modelType: string, modelId: string) =>
    writeAuditLog({ userId, action: "reject", modelType, modelId }),
};
