## 2024-03-20 - [Optimize N+1 queries in dashboard chart cashflow]
**Learning:** Found N+1 behavior in the dashboard chart's cashflow queries (looping `months.map` with `Promise.all` containing separate DB queries for income and expense per month, leading to 12 DB queries instead of 1). This is inefficient, as we can query the database once with `GROUP BY` and handle the data aggregation in memory.
**Action:** Replace multiple queries in loops with a single query leveraging `GROUP BY` date/month grouping or use standard range query.
