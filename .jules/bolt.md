## 2023-10-27 - [N+1 API Query Fixes using Memory Maps]
**Learning:** `Promise.all` mapped over database queries generates N+1 issues that scale poorly.
**Action:** Extract relations, do a single bulk `inArray` query and map the matching arrays in-memory keyed by relation ID.
