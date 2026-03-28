## 2026-03-28 - [N+1 Queries in Reports API]
**Learning:** The `src/app/api/reports/[type]/route.ts` has an N+1 query issue for 'infaq' type where it fetches payments in a loop, and for 'tabungan' type where it fetches savings in a loop.
**Action:** Batch fetch all relevant records (payments or savings) for the collected list of bill IDs or student IDs, and compute aggregations in memory to avoid N+1 issues and significantly improve performance.
