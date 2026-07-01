## 2024-05-23 - Optimize extracurricular GET Endpoint
**Learning:** In Drizzle ORM mappings, using `Promise.all` inside `results.map()` triggers an N+1 query issue for related data, causing major performance bottlenecks as N grows.
**Action:** Replace map-driven fetches with a single `inArray` query extracting all foreign keys, group them into an in-memory `Map`, and perform an O(1) loop-up when serializing the JSON response.
