## 2024-06-08 - [Resolve N+1 query in Extracurricular API]
**Learning:** In a typical REST endpoint mapping database rows, using Promise.all inside a .map() to fetch related data causes an N+1 performance bottleneck.
**Action:** Always pre-fetch related entities in a single query using an IN clause and map them efficiently in memory using a Map data structure.
