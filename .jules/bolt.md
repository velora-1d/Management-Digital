
## 2023-10-25 - Avoid N+1 Queries in Aggregate Reports
**Learning:** For aggregate reports like Infaq and Tabungan, doing a query inside a `map` or `for...of` loop creates an N+1 performance bottleneck.
**Action:** Always fetch all related records in a single batch using `inArray()`, and compute aggregations (like sums or balances) in-memory using a `Map` for O(1) lookups before attaching them to the final result.
