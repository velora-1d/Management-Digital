## 2024-05-20 - Fix N+1 Query in Infaq Reports
**Learning:** Replaced a nested O(N) database query loop (`Promise.all` with individual `db.select`) with a single batch `inArray` fetch and an O(1) in-memory Map lookup. This pattern is essential for performant Drizzle ORM queries when processing list responses.
**Action:** Always extract IDs and use `inArray` combined with an in-memory `Map` aggregation instead of executing database queries within `.map()` loops when building list reports.
