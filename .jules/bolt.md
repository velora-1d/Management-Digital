## 2024-05-24 - N+1 Query Anti-Pattern in API Routes
**Learning:** Several API routes use `Promise.all(results.map(...))` to fetch related records in a loop, causing an N+1 query bottleneck.
**Action:** Replace looped queries with a single batch fetch using Drizzle's `inArray` and correlate the results in memory using a `Map`.
