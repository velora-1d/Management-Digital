## 2026-05-20 - Fix XSS Risk in Inventory Table
**Vulnerability:** Use of dangerouslySetInnerHTML with unescaped HTML strings in badge rendering.
**Learning:** Constructing raw HTML strings with class names and injecting them into the DOM directly poses a high XSS risk and violates React security best practices.
**Prevention:** Replace all dangerouslySetInnerHTML usages with standard React JSX component rendering and conditional CSS classes.
