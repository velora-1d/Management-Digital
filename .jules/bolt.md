## 2025-05-16 - Optimize N+1 Query in Reports API
**Learning:** Sequential `for...of` loops and `Promise.all` `.map()` statements for related Drizzle ORM queries lead to severe N+1 database roundtrips. Batching queries via `inArray` and performing in-memory mapping using a `Map` is significantly more performant.
**Action:** Use `inArray` for retrieving related records outside of loops, and always verify the array is not empty before executing to avoid SQL IN clause errors.
