## 2024-05-01 - Fix N+1 queries in loop over database results
**Learning:** Performing multiple individual `select` queries within a `for...of` loop or `Promise.all` `.map()` causes an N+1 query problem, severely degrading database performance when processing multiple records.
**Action:** Replace `for...of` loop queries with a single batched fetch using Drizzle ORM's `inArray` operator, then build an in-memory `Map` or hash map to correlate results with O(1) lookups. Ensure `inArray` is conditionally executed only when the array length is > 0 to avoid ORM errors.
