## YYYY-MM-DD - [Title]
**Vulnerability:** [What you found]
**Learning:** [Why it existed]
**Prevention:** [How to avoid next time]
## 2025-06-05 - Fix XSS Vulnerability in Inventory Page
**Vulnerability:** The application used `dangerouslySetInnerHTML` to render a status badge inside a table cell.
**Learning:** While the input string in this specific instance was hardcoded and not strictly exploitable, the pattern itself is inherently dangerous and violates security scanner policies. By avoiding raw string concatenation entirely, we eliminate future risk if this badge is ever parameterized.
**Prevention:** Avoid constructing raw HTML strings and using `dangerouslySetInnerHTML`. Rely on safe, standard React JSX components to prevent XSS.
