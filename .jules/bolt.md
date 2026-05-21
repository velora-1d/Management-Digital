## 2024-05-24 - Fix N+1 Query in Curriculum API Route
**Learning:** Found an N+1 query issue in `src/app/api/curriculum/route.ts` where we fetch gradeComponents using `.map` with `Promise.all` leading to N DB queries. Replacing it with a single `inArray` DB call inside an if block checking `if (curriculumIds.length > 0)` and grouping via Map lookup greatly reduces the overhead, effectively turning O(N) queries into 1 query.
**Action:** When mapping DB records for relation fields, collect IDs, execute a single `inArray` fetch and use in-memory Map lookup.
