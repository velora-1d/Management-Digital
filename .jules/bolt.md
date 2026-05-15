## 2024-05-15 - Eliminate N+1 Queries in Reports API
**Learning:** Sequential `await Promise.all(array.map(...))` and `for (const x of array)` loop structures performing individual database queries represent significant N+1 performance bottlenecks, severely scaling latency as data grows.
**Action:** Replaced iterative database queries with a single batched `inArray` fetch guarded by `if (ids.length > 0)`, using an in-memory `Map` lookup for O(1) correlation, vastly improving backend report generation speed.
