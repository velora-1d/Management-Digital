## 2024-05-24 - Empty Array Guards for Drizzle `inArray`
**Learning:** Drizzle ORM throws SQL syntax errors if an empty array is passed to `inArray()`.
**Action:** Always add an early return or guard clause like `if (items.length === 0) return []` before performing batch database queries using `inArray`.