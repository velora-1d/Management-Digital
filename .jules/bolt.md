## 2026-06-22 - Optimize N+1 Query in Extracurricular API
**Learning:** Promise.all inside a .map() loop caused an N+1 query when fetching extracurricular members. Using a Map data structure to pre-process relational data converts O(M) search operations inside the loop into O(1) lookups.
**Action:** Pre-fetch related entities in a single query using an inArray clause and map them in memory using a Map.
