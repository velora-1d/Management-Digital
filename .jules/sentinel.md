## 2025-05-18 - [Fix XSS via dangerouslySetInnerHTML in React]
**Vulnerability:** A Cross-Site Scripting (XSS) vulnerability pattern was found in `src/app/(dashboard)/inventory/page.tsx`. Badges conditionally rendering HTML strings were evaluated via `dangerouslySetInnerHTML={{ __html: badge }}`.
**Learning:** In standard React code, raw HTML construction should be avoided. Relying on `dangerouslySetInnerHTML` bypasses React's native XSS protection when evaluating strings that could originate from or be influenced by un-sanitized user inputs.
**Prevention:** Use standard JSX elements and React conditionals instead of building raw HTML strings, which enforces type safety, improves maintainability, and mitigates XSS risks.
