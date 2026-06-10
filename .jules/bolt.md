## 2024-06-10 - Extracurricular N+1 Query
**Learning:** Promise.all with nested db.select inside map creates N+1 query bottlenecks on large sets. Pre-fetching using inArray and grouping results into a Map is significantly faster.
**Action:** Use inArray to pre-fetch relational data outside of loops.
