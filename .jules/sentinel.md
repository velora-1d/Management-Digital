## 2026-03-28 - Fix XSS Vulnerability in Inventory Page
**Vulnerability:** A Cross-Site Scripting (XSS) vulnerability was found in the inventory page where `dangerouslySetInnerHTML` was used to render a badge component string directly from a condition property.
**Learning:** Using `dangerouslySetInnerHTML` with locally generated strings, even if seemingly safe, violates React's built-in XSS protections and can lead to security issues if not carefully managed or if data is later tainted.
**Prevention:** Always use native React JSX elements for conditional rendering and component composition instead of building HTML strings and setting them via `dangerouslySetInnerHTML`.
