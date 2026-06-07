## 2024-05-24 - Pre-aggregating data
**Learning:** In src/app/api/employee-attendance/recap/route.ts, mapping employees and filtering all attendances per employee yields O(N*M) performance, which is slow for large datasets. Pre-aggregating attendances using a Map lookup solves this.
**Action:** Use Map for O(1) lookups instead of nested array filters when aggregating relational data in memory.
