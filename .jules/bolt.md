## 2024-05-24 - Eliminate N+1 Queries with Promise.all in Drizzle ORM
**Learning:** Using `Promise.all` combined with `.map()` to perform iterative Drizzle ORM database queries is a performance anti-pattern that creates N+1 query bottlenecks.
**Action:** Replace these iterative `Promise.all` database fetches with a single `inArray()` batch query. Then, group the batched results using an in-memory `Map` lookup keyed by the reference ID for O(1) correlation. Always ensure early return if the ID array is empty, and check that IDs are not null when populating the map.
