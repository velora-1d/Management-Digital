## 2026-06-20 - Optimize N+1 in DB Array iteration
**Learning:** API loops iterating via 'Promise.all(arr.map(..db.select()))' are massive performance blockers and vulnerable to scale-up N+1 overhead.
**Action:** Utilize 'inArray()' inside a single db search before mapping, caching results into a 'Map' to get O(1) matching latency inside local lists.
