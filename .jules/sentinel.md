## 2026-06-23 - XSS via dangerouslySetInnerHTML
**Vulnerability:** Found an XSS vulnerability in src/app/(dashboard)/inventory/page.tsx where `dangerouslySetInnerHTML` was used to render a status badge constructed via raw HTML string interpolation.
**Learning:** Raw HTML strings dynamically generated and inserted via dangerouslySetInnerHTML represent a vector for XSS, even if currently controlled by expected app state. This pattern breaks React's built-in XSS protection.
**Prevention:** Avoid `dangerouslySetInnerHTML` when mapping array elements. Eliminate raw HTML string construction by replacing them with safe, conditional JSX component rendering.
