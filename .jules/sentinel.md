## 2026-05-10 - Fix XSS in React Map using `dangerouslySetInnerHTML`
**Vulnerability:** XSS vulnerability found in mapping array elements to raw HTML string utilizing `dangerouslySetInnerHTML` in `src/app/(dashboard)/inventory/page.tsx`.
**Learning:** In Next.js/React, rendering mapped properties into raw HTML with string concatenations inside a loop creates risks of XSS as variables can be injected if modified maliciously in DB.
**Prevention:** Utilize standard JSX elements and components for rendering HTML structures instead of constructing strings and injecting them via `dangerouslySetInnerHTML`.
