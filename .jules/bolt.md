## 2025-02-12 - Optimize cashflowData fetching
**Learning:** In Next.js dashboard charts, aggregating monthly data in a loop triggers N+1 queries. We can optimize it into a single query using Drizzle ORMs groupBy with PostgreSQL extract(month) function.
**Action:** Group by year and month directly in a single database query, then construct the final array structure in-memory.
