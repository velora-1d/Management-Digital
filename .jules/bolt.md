## 2024-03-24 - Eliminated N+1 Query in Curriculum API
**Learning:** Found an N+1 query vulnerability when iterating through arrays of curriculum IDs and fetching components separately via `Promise.all`.
**Action:** Always replace inner-loop API/DB operations with bulk single `inArray` queries and construct `Map` lookups in-memory when returning 1-to-many joined structures to reduce database round-trips.
