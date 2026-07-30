## 2024-03-01 - [Refactor Cashflow Chart to eliminate N+1 query]
**Learning:** Resolving N+1 performance bottlenecks involving time-series aggregations should avoid executing queries inside loops. Combining a single query using Drizzle ORMs groupBy with PostgreSQL date functions avoids queries in loop. For matching, extract year and month as integers to map results in-memory securely.
**Action:** Use Drizzles groupBy and SQL extract date functions with an in-memory Map when building charts or time-series reports.
