## 2026-06-17 - N+1 Query Using Promise.all in Route Handlers
**Learning:** The codebase has patterns where database relation fetching is handled using `Promise.all()` with a `.map()` inside Next.js route handlers (e.g., `src/app/api/extracurricular/route.ts`). This leads to severe N+1 database queries when paginating results.
**Action:** Always scan for `Promise.all(.*map(.*async` patterns in `src/app/api/` routes. Refactor them by plucking IDs, using Drizzle's `inArray` for a single O(1) query, and grouping the results in-memory with a `Map` to map them back safely.
