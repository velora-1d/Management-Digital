## 2026-04-16 - Safe empty array handling in batch queries
**Learning:** When using `inArray()` to solve N+1 problems, passing an empty array to Drizzle ORM translates to an invalid SQL `IN ()` clause which causes runtime query failures.
**Action:** Always wrap `inArray()` batch fetches inside a guard condition (e.g., `if (ids.length > 0)`) to ensure structurally sound query generation.
