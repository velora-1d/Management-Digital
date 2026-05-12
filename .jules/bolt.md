## 2024-05-13 - N+1 bottlenecks in Reports Route
**Learning:** Found an instance in `src/app/api/reports/[type]/route.ts` where querying `tabungan` and `infaq` sequentially fetched relations per row using `.map()` with `Promise.all` and sequential `for...of` loops, causing severe N+1 latency.
**Action:** Replace `Promise.all` with `.map()` and `for...of` patterns with single batch fetches utilizing Drizzle's `inArray()` and aggregate into memory using `Map` lookups for $O(1)$ correlation.
