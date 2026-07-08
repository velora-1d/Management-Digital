## 2024-07-08 - Bolt N+1 Optimization for Curriculum API
**Learning:** Found N+1 query pattern in `src/app/api/curriculum/route.ts` where `Promise.all` + `results.map` loops over `curriculums` to fetch related `gradeComponents`. This can be optimized using `inArray` to fetch all related components in a single query and group them in memory.
**Action:** Replace `Promise.all` + `.map()` loops fetching related data with a single `inArray` query and an in-memory `Map` keyed by the foreign key to map relationships.
