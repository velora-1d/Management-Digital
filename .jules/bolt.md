## 2024-05-24 - Resolve N+1 Drizzle Promise.all Performance Bottlenecks
**Learning:** Promise.all combined with map to perform nested queries causes N+1 bottlenecks.
**Action:** Always rewrite with Drizzle `inArray` to query in a single batch, and use Map to correlate and restructure the query responses in O(1) time without triggering any N+1.
