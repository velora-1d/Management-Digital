## 2024-06-14 - Fix XSS Vulnerability in Inventory
**Vulnerability:** Raw HTML injection using dangerouslySetInnerHTML.
**Learning:** String interpolation for badges creates XSS risks and React warnings.
**Prevention:** Always use safe, conditional JSX component rendering instead of dangerouslySetInnerHTML.
