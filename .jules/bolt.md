## 2024-06-13 - [Fix N+1 query extracurricularMembers]
**Learning:** In Drizzle ORM mapping arrays to resolve nested components via Promise.all results in N+1 database queries. A `Map` and `inArray` can be used to dramatically lower execution queries.
**Action:** Use an in-memory Map keyed by foreign key to aggregate pre-fetched components to optimize loop resolutions.
