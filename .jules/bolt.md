## 2025-02-18 - N+1 Query in Extracurricular Members Fetching
**Learning:** The `GET` endpoint for extracurriculars was iterating over each extracurricular and executing a separate database query to fetch its members, leading to an N+1 query bottleneck.
**Action:** Replaced the iterative fetching with a batch fetch using Drizzle ORM's `inArray()` clause, mapping the results in memory for O(1) correlation back to the original objects.
