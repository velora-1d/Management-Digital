## 2024-03-29 - Number Conversion for PostgreSQL Numerics in Drizzle
**Learning:** When retrieving numeric or decimal types (e.g., amounts) from PostgreSQL via Drizzle ORM, the pg driver may return them as strings. Always explicitly cast these values to `Number()` in JavaScript before performing aggregations to prevent string concatenation bugs.
**Action:** Use `Number(value)` when aggregating `amountPaid`, `nominal`, or `amount` fields retrieved via Drizzle ORM.

## 2024-03-29 - Avoiding N+1 Queries with inArray()
**Learning:** For aggregate reports (like Infaq and Tabungan) in 'src/app/api/reports/[type]/route.ts', avoid N+1 queries by batch-fetching related records with Drizzle's 'inArray()' and computing aggregations in-memory using a Map for O(1) lookups.
**Action:** Extract IDs, fetch related records in a single query using `inArray`, group/aggregate data in a Map, and iterate the base records. Always check `array.length > 0` before calling `inArray()`.
