## 2024-05-28 - N+1 Query in Extracurricular API
**Learning:** API route src/app/api/extracurricular/route.ts used a .map(async () => ...) to fetch members for each extracurricular individually, creating an N+1 query bottleneck.
**Action:** Replaced the loop with a single batched inArray query and an O(1) Map lookup. Always use batched queries instead of querying inside a loop.
