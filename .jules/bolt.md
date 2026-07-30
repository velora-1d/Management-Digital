## 2024-05-18 - Dashboard N+1 Time-Series Queries
**Learning:** Using `Promise.all` inside `.map()` loops for time-series aggregation (like fetching cashflow per month over 6 months) creates an N+1 query problem that scales linearly with the number of periods.
**Action:** Consolidate into a single database query using Drizzle ORM`s `groupBy` combined with PostgreSQL `extract(year from ...)` and `extract(month from ...)`, and map the aggregated results back into the expected time-series format in-memory.
