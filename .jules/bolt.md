## 2025-05-23 - Handle Empty Arrays in Drizzle inArray
**Learning:** Using `inArray` in Drizzle with an empty array will throw a syntax error in PostgreSQL/MySQL.
**Action:** Always add an early return (`if (array.length === 0) return ...`) before executing queries that rely on `inArray` with user-provided or dynamically generated arrays.
