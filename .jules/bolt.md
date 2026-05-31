## 2024-05-24 - N+1 Query Anti-Pattern in Reports API
**Learning:** The `reports/[type]` API routes for `infaq` and `tabungan` exhibited a severe N+1 query bottleneck by fetching individual payments/savings sequentially within `Promise.all(bills.map(...))` and `for...of` loops. This scales poorly with many bills or students.
**Action:** Replaced sequential queries with a single batch `inArray` query outside the loop to fetch all related records at once, then pre-aggregated the results into an in-memory `Map<number, number>` for O(1) correlation during the final data mapping.
