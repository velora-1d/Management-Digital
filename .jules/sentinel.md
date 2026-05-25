## 2025-02-18 - XSS via dangerouslySetInnerHTML in Inventory
**Vulnerability:** Found `dangerouslySetInnerHTML` rendering unsanitized user-generated (although currently just hardcoded styles) badge HTML in the inventory page `src/app/(dashboard)/inventory/page.tsx`. While currently just an enhancement, it is a bad practice. I will also investigate other XSS in Swal.fire.
**Learning:** React components should map data to JSX elements, rather than constructing raw HTML strings and using `dangerouslySetInnerHTML`, which opens the door to XSS.
**Prevention:** Eliminate `dangerouslySetInnerHTML` from the codebase, replacing raw HTML string construction with safe React JSX mapping.
