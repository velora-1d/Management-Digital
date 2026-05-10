## 2024-05-10 - Eliminate N+1 Queries in Reports
**Learning:** Using `Promise.all` inside `.map()` or sequential `for...of` loops to query the database per row creates an N+1 query bottleneck. This drastically degrades performance as the number of rows (e.g. bills or students) grows.
**Action:** Replace iterative ORM queries with a single `inArray()` batch fetch, and use an in-memory `Map` lookup to correlate the fetched data with the source entities in O(1) time. Always check if the ID array is not empty before making the `inArray()` query to prevent errors.
