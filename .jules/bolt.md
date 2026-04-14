## 2024-04-14 - Eliminated N+1 Query Anti-Pattern in API Route
**Learning:** Found an anti-pattern in the codebase where developers use `Promise.all(array.map(...))` to perform database queries in a loop, resulting in severe N+1 query bottlenecks.
**Action:** Replace `Promise.all` + `map` loops with a single Drizzle batch fetch using `inArray()` and correlate the results in JavaScript/TypeScript using an in-memory `Map` for O(1) correlation. This dramatically reduces the number of database queries and improves performance.
