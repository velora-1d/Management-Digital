## 2025-02-12 - Eliminate dangerouslySetInnerHTML to prevent XSS
**Vulnerability:** Found `dangerouslySetInnerHTML={{ __html: badge }}` in `src/app/(dashboard)/inventory/page.tsx` mapping loop. It renders raw HTML constructed via string concatenation, introducing an XSS vulnerability.
**Learning:** `dangerouslySetInnerHTML` should be avoided when constructing HTML elements based on variable content.
**Prevention:** Always replace raw HTML string construction with safe React JSX rendering using standard components and conditional rendering.
