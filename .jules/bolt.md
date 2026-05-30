## 2025-02-14 - Optimize O(N^2) loops for statistics computation
**Learning:** In statistics recapitulation routes (like attendance and employee-attendance), iterating over a list of students/employees and running multiple `.filter()` calls on an entire list of attendance records creates significant N+1 overhead with a computational complexity of O(N*M).
**Action:** Use an in-memory `Map` keyed by studentId/employeeId to pre-aggregate these counts in a single pass O(M), enabling O(1) statistical lookups during the final formatting map loop.
