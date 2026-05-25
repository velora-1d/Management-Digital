## 2024-05-18 - Dashboard N+1 Queries
**Learning:** Found an N+1 query issue in `src/app/api/dashboard/charts/route.ts` where it executes a pair of database queries (`income` and `expense` sums) inside a 6-iteration map (`Promise.all` + `map`), resulting in 12 separate queries for a 6-month cashflow chart.
**Action:** Consolidate these queries into a single query using `GROUP BY` and then process the result in memory, transforming 12 DB calls into 1.
