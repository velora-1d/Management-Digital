
## 2024-05-30 - N+1 Bottlenecks in Promise.all Map Loops
**Learning:** Using `Promise.all(array.map(...))` to perform individual Drizzle database queries inside a route handler causes massive N+1 connection overhead, especially in report generation routes where the arrays can be large.
**Action:** Always replace `Promise.all` database loops with a single Drizzle `inArray()` batch query. Map the IDs first, execute the query, and use an in-memory `Map` (checking `id !== null`) to associate the batched results back to the original array items in O(1) time.
