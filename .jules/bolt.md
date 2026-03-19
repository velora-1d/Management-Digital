## 2026-03-19 - [Bulk DB Operations via onConflictDoUpdate]
**Learning:** Manual DB upsert inside `for...of` loops creates a severe N+1 bottleneck during POST requests. Drizzle's `.onConflictDoNothing()` and `.onConflictDoUpdate()` are much more efficient for bulk upserts.
**Action:** Always map inputs to arrays and use bulk `.insert(table).values(array).onConflictDo...()` for assignments, checking `array.length > 0` first.
