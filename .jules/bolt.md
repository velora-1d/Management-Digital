## 2024-05-18 - Fix N+1 queries in Reports API
**Learning:** Using `Promise.all` + `.map()` or `for...of` loops to perform iterative database queries (like fetching payments for each bill or savings for each student) creates severe N+1 query bottlenecks.
**Action:** Always replace these loops with a single `inArray()` batch fetch. Ensure we add an early return check (`if (ids.length === 0)`) to avoid empty `IN ()` clauses, and use an in-memory Map to correlate results in O(1) time, checking for `id !== null`.
