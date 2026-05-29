## 2026-05-29 - [N+1 Query in Curriculum API]
**Learning:** The `src/app/api/curriculum/route.ts` had an N+1 performance bottleneck where `Promise.all(results.map(...))` was executing a separate database query to fetch `gradeComponents` for every curriculum record returned.
**Action:** Use Drizzle's `inArray` combined with an in-memory `Map` to fetch and group all necessary related entities in a single batch query (1)$ instead of inside an asynchronous loop (N)$.
