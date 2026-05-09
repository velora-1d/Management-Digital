## 2024-05-24 - Resolve N+1 queries in report generation
**Learning:** Using `Promise.all` coupled with `.map()` or `for...of` loops to execute Drizzle queries results in severe N+1 bottlenecks, especially impacting large payload requests like reports.
**Action:** Replace looped DB queries with single batch queries using `inArray()` and correlate results using O(1) lookups with an in-memory `Map`. Always guard `inArray()` with a length check (e.g., `ids.length > 0`) to prevent ORM errors on empty arrays.
