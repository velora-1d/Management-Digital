## 2024-06-25 - N+1 Query on /api/curriculum
**Learning:** Found an N+1 query issue in `src/app/api/curriculum/route.ts` where it was doing a `Promise.all` inside `.map` to fetch `gradeComponents` for each `curriculum`.
**Action:** Always fetch related records in a single query using `inArray()` when retrieving a list of entities.
