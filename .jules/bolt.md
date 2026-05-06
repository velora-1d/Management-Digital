## 2026-05-06 - [N+1 query in API Route map loops]
**Learning:** In Next.js route handlers, when processing Drizzle results with a nested mapping of `Promise.all`, assigning typing to the mapped object inline using `[] as any[]` is flagged by the project's strict ESLint rules against `any`.
**Action:** Use Drizzle's inferred types like `type GradeComponent = typeof gradeComponents.$inferSelect;` and type arrays correctly (e.g., `[] as GradeComponent[]`) to map complex query structures without introducing N+1 queries or ESLint errors.
