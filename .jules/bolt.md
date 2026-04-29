## 2023-10-27 - Eliminate N+1 Query in Curriculum API
**Learning:** Found an N+1 query vulnerability when iterating over database results with `Promise.all(results.map(...))` and making individual queries (`db.select().where(eq(...))`) for each item inside the map. This is a common pattern in the codebase.
**Action:** Replace `Promise.all` and `.map()` with a single `inArray()` batch query to fetch all required relations simultaneously. Then, build an in-memory `Map` keyed by the foreign key to perform an O(1) grouping, and finally, map the grouped items back to the original results.
