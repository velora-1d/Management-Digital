## 2023-10-27 - Eliminate N+1 queries in aggregate reports
**Learning:** Using `Promise.all` mapped over a large array to perform individual database queries creates a massive N+1 bottleneck, which is particularly severe in report generation endpoints where thousands of rows might be iterated over.
**Action:** Always batch fetch related records using Drizzle's `inArray()` with a collected array of IDs, and aggregate the data in memory using a `Map` for O(1) lookup.
