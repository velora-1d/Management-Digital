## 2024-05-05 - Optimize `Promise.all` + `.map` N+1 queries in `src/app/api/extracurricular/route.ts`
**Learning:** Found an N+1 query issue in `src/app/api/extracurricular/route.ts` where a loop fetches `extracurricularMembers` for each `extracurricularId` independently using `Promise.all(results.map(...))`. This creates a database call per result, reducing performance.
**Action:** Replaced the loop with a single `inArray()` batch fetch, mapping the results efficiently in-memory to achieve an $O(1)$ query overhead.
