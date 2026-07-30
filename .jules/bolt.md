## 2025-02-17 - N+1 in map loops
**Learning:** Promise.all inside array.map doing DB queries leads to N+1 problem.
**Action:** Pre-fetch related entities with inArray and use memory maps for aggregation.
