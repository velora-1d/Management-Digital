## 2025-06-11 - Resolving N+1 Promise.all anti-pattern
**Learning:** Promise.all inside map leads to N+1 bottleneck when querying DB. The Drizzle inArray feature allows bulk fetches which can then be assembled O(N) in memory.
**Action:** Use inArray to batch fetch nested resources and map them.
