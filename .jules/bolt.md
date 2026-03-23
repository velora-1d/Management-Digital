## 2025-02-28 - N+1 Query in reports aggregate endpoint
**Learning:** In the reporting endpoint for 'infaq' and 'tabungan' (`src/app/api/reports/[type]/route.ts`), there are significant N+1 queries due to fetching payments/savings per student/bill inside a map or for loop.
**Action:** Batch fetch related records for reports using `inArray()` and aggregate in-memory with Maps to achieve O(1) lookups instead of executing database queries in a loop.
