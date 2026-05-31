## 2024-05-18 - [Fix] Eliminate dangerouslySetInnerHTML in Inventory List
**Vulnerability:** A Cross-Site Scripting (XSS) vulnerability was identified in `src/app/(dashboard)/inventory/page.tsx` where status badges were rendered using `dangerouslySetInnerHTML` with raw HTML strings.
**Learning:** Even if the HTML strings are hardcoded based on conditions and do not immediately include user input, relying on `dangerouslySetInnerHTML` is an anti-pattern. Future modifications could inadvertently introduce dynamic data, leading to a live XSS vulnerability.
**Prevention:** Always use standard React JSX components and safe attribute mappings (like `className` instead of `class`) to render UI elements conditionally, avoiding `dangerouslySetInnerHTML` entirely.
