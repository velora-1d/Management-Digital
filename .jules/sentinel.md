## 2024-05-30 - Remove dangerouslySetInnerHTML in Inventory Page
**Vulnerability:** The `src/app/(dashboard)/inventory/page.tsx` used `dangerouslySetInnerHTML` to render HTML badge strings dynamically for item conditions.
**Learning:** While the strings were statically defined in the component logic (and thus not immediately exploitable by user input), using `dangerouslySetInnerHTML` is an anti-pattern when standard React JSX elements can achieve the same result. Removing it eliminates the risk of future Cross-Site Scripting (XSS) if developers were to update those string templates to interpolate unsanitized user data.
**Prevention:** Always use safe, conditional JSX component rendering instead of raw HTML strings and `dangerouslySetInnerHTML`.
