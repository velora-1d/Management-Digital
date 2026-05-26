## 2024-05-26 - [N+1 Query Resolution in Next.js API Routes]
**Learning:** Sequential await loops or `Promise.all` inside `.map` over DB queries create severe N+1 bottlenecks.
**Action:** Replace `Promise.all(arr.map(db.select()...))` with a single `inArray()` fetch, then manually map the results in memory using a lookup Map.
