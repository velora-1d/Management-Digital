## 2024-05-24 - Batching Queries Instead of Promise.all in Drizzle
**Learning:** Promise.all combined with `.map()` to perform iterative Drizzle ORM database queries is a performance anti-pattern that creates N+1 query bottlenecks.
**Action:** Replace these loops with a single `inArray()` batch fetch and use an in-memory `Map` lookup for O(1) correlation.
