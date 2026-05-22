## 2024-05-18 - Fix N+1 Query in Extracurricular API
**Learning:** Using Promise.all with .map() to perform iterative database queries creates an N+1 bottleneck. Batching the queries with inArray() and using an in-memory Map lookup turns it into a more efficient O(1) process.
**Action:** Always batch related entity fetching outside of the map() function using inArray() and correlate them in memory.
