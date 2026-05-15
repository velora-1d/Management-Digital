## 2024-05-15 - Remove dangerouslySetInnerHTML in inventory page
**Vulnerability:** XSS vulnerability through dangerouslySetInnerHTML in data table mapping.
**Learning:** Raw HTML string construction and dangerouslySetInnerHTML within array mappings bypass Reacts XSS protection.
**Prevention:** Use conditional JSX rendering instead of dangerouslySetInnerHTML.
