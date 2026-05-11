## 2026-05-11 - Optimize Curriculum API Components Fetching
**Learning:** The previous implementation used `Promise.all(results.map(...))` with individual `.where()` queries per curriculum, leading to N+1 query bottlenecks on large curriculum arrays.
**Action:** Replaced the mapped Promise execution with a single batched `inArray` database fetch and an O(1) in-memory `Map` aggregation pattern, maintaining exactly the same output shape.
