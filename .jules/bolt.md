## 2024-05-18 - Fix N+1 Query in Curriculum API
**Learning:** Resolving N+1 query bottlenecks caused by fetching related entities inside a `.map()` loop is critical for performance. Pre-fetching via `inArray` and utilizing an in-memory `Map` structure converts O(M) lookups into O(1).
**Action:** Whenever iterating over results to fetch related entities, consolidate into a single pre-fetch query and use a Map for efficient assignment.
