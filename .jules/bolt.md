## 2024-07-06 - N+1 Query in Promise.all map
**Learning:** Promise.all combined with map() for database fetching inside API routes causes N+1 query bottlenecks which degrades performance on lists.
**Action:** Always pre-fetch related entities in a single query using `inArray` and map them in-memory using a Map object keyed by the foreign key.
