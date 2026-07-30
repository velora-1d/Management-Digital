## 2024-06-05 - Fix N+1 Query in Dashboard Charts
**Learning:** Time-series data grouping over multiple months should not be executed inside a loop. This creates an N+1 query problem, increasing latency due to multiple database roundtrips.
**Action:** Use Drizzle ORM single query with `groupBy` and `sql` extracting year and month, then map the aggregated results to the UI format in-memory.
