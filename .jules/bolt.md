## 2024-05-24 - N+1 Queries in Dashboard Summaries
**Learning:** Promise.all with .map containing database queries creates N+1 bottlenecks.
**Action:** Replace map with a single inArray query where possible.
