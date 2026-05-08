## 2024-05-23 - [Reporting N+1 Queries]
**Learning:** Promise.all combined with .map(), or sequential for...of loops to perform iterative database queries (like for infaqPayments or studentSavings per student) are severe performance anti-patterns creating N+1 query bottlenecks that delay report generation.
**Action:** Replaced these nested queries with a single batch fetch using `inArray` along with an in-memory `Map` for O(1) correlation of the grouped results.
