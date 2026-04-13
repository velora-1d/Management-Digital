## 2026-04-13 - Prevent Drizzle ORM N+1 Query bottlenecks
**Learning:** Using Promise.all with .map() to perform Drizzle ORM queries creates severe N+1 bottlenecks.
**Action:** Always extract IDs and use a single `inArray` query. Add an early return for empty arrays (`if (array.length === 0)`) to avoid Drizzle ORM syntax errors, and group results using an in-memory Map for O(1) correlation.
