## 2026-05-18 - Fix N+1 Queries in Reports API
**Learning:** Using `Promise.all(bills.map(...))` and `for (const s of activeStudents)` with database queries creates severe N+1 bottlenecks. Aggregating results with `inArray` and in-memory Maps is significantly more efficient.
**Action:** Replaced iterative ORM queries inside loops with single batch `inArray` queries and \(O(1)\) hash map lookups.
