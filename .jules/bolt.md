## 2026-04-25 - Fix N+1 Query in Extracurriculars API
**Learning:** Nested `Promise.all` with `map` queries fetching related records is a common N+1 pattern in Next.js/Drizzle backend code.
**Action:** Replace `Promise.all(results.map(...))` database query loops with a single batch fetch using Drizzle ORM's `inArray()`, and group the results by parent ID using an in-memory `Map` with structurally safe correlation. Always check that the ID array is not empty before calling `inArray()`.
