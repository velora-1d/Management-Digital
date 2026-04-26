## 2026-04-26 - Eliminate N+1 Query in Reports API
**Learning:** Sequential DB queries in loops (Promise.all + map or for...of) cause severe N+1 bottlenecks.
**Action:** Replace loops with a single Drizzle inArray() batch fetch and an in-memory Map lookup for O(1) correlation.
