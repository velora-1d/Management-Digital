## 2026-05-01 - Fix N+1 query in Extracurricular API route
**Learning:** Using `Promise.all(results.map(...))` with Drizzle ORM queries inside creates a severe N+1 performance bottleneck. Next.js API routes handling large lists should avoid this.
**Action:** Use a single `inArray` batch query coupled with an in-memory `Map` lookup ((1)$ correlation) to replace iterative asynchronous queries.
