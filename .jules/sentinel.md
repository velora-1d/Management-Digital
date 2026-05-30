## 2024-05-30 - Fix XSS in Inventory Component
**Vulnerability:** A React component (`InventoryPage`) was rendering condition badges using `dangerouslySetInnerHTML` with raw HTML strings. While the data sources (`"Baik"`, `"Rusak Ringan"`, etc.) appeared static in this context, it created a potential XSS vector if those condition strings were ever dynamically injected from user input.
**Learning:** Developer convenience (building HTML strings) overrode React security best practices. `dangerouslySetInnerHTML` is almost never needed for structural UI rendering like badges.
**Prevention:** Use standard React conditional rendering to build JSX elements natively. Ensure attributes are mapped correctly (`class` to `className`) when converting raw HTML to JSX.
