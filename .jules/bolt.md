## 2024-06-02 - Resolve N+1 query bottleneck in dashboard charts cashflow data
**Learning:** When aggregating time-series data grouped by month, looping over date intervals and firing individual queries per interval creates an N+1 query problem. Grouping by extracted year and month on a single batched query is far superior.
**Action:** Use Drizzle ORM `groupBy` combined with `sql\`extract(month/year)\`` for efficient SQL time-series aggregations instead of concurrent loop queries.
