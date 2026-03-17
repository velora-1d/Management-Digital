# Bolt's Journal

## 2026-03-17 - Optimize Bulk Upserts with Drizzle's ON CONFLICT DO UPDATE
**Learning:** Saving an entire classroom's grades inside a `for...of` loop with a `.select().limit(1)` followed by an `.insert()` or `.update()` for each student triggers a severe N+1 query problem, creating heavy database load and significant latency for the user. Drizzle ORM supports `onConflictDoUpdate()`, which allows performing the entire array's upsert operation in a single query.
**Action:** Always utilize `.values(array).onConflictDoUpdate()` for bulk upsert operations instead of manually iterating over the records. Ensure `uniqueIndex` constraints are properly set in the schema on the matching fields (`target`).
