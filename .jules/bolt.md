## 2024-06-18 - Fix N+1 queries using inArray batch fetching
**Learning:** In Drizzle ORM, loops containing database queries mapping across related records will create critical N+1 bottlenecks.
**Action:** Always extract relation IDs, use Drizzle's `inArray()` to perform a single batch query, and compute related values by iterating over the returned records using an in-memory `Map` with type casting (`Number()`) where needed.
