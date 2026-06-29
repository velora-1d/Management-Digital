## 2025-06-29 - Fixed N+1 Query in Curriculum API
**Learning:** Drizzle ORM's `inArray` is an effective way to optimize nested `Promise.all(.map)` queries into a single database fetch mapped in-memory. However, passing an empty array to `inArray` can cause SQL syntax errors or execute unnecessary database queries.
**Action:** Always guard the query with an array length check (e.g., `if (ids.length > 0)`) before executing an `inArray` clause.
