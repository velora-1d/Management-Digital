## 2026-05-11 - [Fix XSS in Inventory Table]
**Vulnerability:** XSS vulnerability by rendering raw HTML directly via dangerouslySetInnerHTML
**Learning:** The badge components were rendered with raw strings and parsed unsafely.
**Prevention:** Use strictly-typed JSX variables instead of parsing raw HTML strings with dangerouslySetInnerHTML.
