## 2024-04-20 - N+1 Query in Drizzle ORM
**Learning:** Using `Promise.all` combined with `.map()` to perform iterative Drizzle ORM database queries is a severe performance anti-pattern that creates N+1 query bottlenecks in API routes.
**Action:** Replace these loops with a single `inArray()` batch fetch wrapped in a safety check (`if (array.length > 0)`) and use an in-memory `Map` lookup for O(N) grouping and correlation.
