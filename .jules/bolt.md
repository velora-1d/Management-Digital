## 2024-05-13 - Eliminate N+1 DB Queries in Reports API
**Learning:** The project pattern used mapping with DB queries inside `Promise.all` leading to N+1 querying patterns which block system throughput.
**Action:** Replaced sequential queries within `bills.map` and `activeStudents` loops with single `inArray` batch fetch statements in `src/app/api/reports/[type]/route.ts`, alongside correlating records using an O(1) in-memory `Map`.
