## 2026-05-03 - Fixed N+1 Query in API Route
**Learning:** The database query `Promise.all(results.map(...))` pattern is a known performance anti-pattern. Next.js API routes may execute these sequentially inside the loop, compounding request delays significantly on production.
**Action:** Replaced iterative ORM calls in API routes with a single batch  fetch combined with an (1)$ in-memory  correlation lookup.
## 2026-05-03 - Fixed N+1 Query in API Route
**Learning:** The database query Promise.all(results.map(...)) pattern is a known performance anti-pattern. Next.js API routes may execute these sequentially inside the loop, compounding request delays significantly on production.
**Action:** Replaced iterative ORM calls in API routes with a single batch inArray() fetch combined with an O(1) in-memory Map correlation lookup.
