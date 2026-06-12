## 2026-06-12 - Prevent N+1 on Curriculum Endpoints
**Learning:** The curriculum API endpoint utilized Promise.all within a .map() loop to fetch grade components dynamically, triggering an N+1 query issue directly tied to route performance.
**Action:** Replaced looped Promise.all executions with a single bulk query using the `inArray` Drizzle operator and mapped values in memory to achieve O(1) matching.
