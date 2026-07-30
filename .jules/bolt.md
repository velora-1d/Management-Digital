## 2025-02-24 - Fix N+1 Query in Extracurricular API
**Learning:** Using Promise.all inside a .map() to fetch database entities creates an N+1 query bottleneck.
**Action:** Use Drizzle ORM inArray to pre-fetch all related entities in a single query and map them in memory.
