## 2026-05-08 - [Replace dangerouslySetInnerHTML with JSX]
**Vulnerability:** XSS vulnerability through dangerouslySetInnerHTML in React component rendering inventory condition badges.
**Learning:** dangerouslySetInnerHTML is a potential XSS vector, even for simple variables, and violates secure coding standards when standard JSX can be used.
**Prevention:** Use standard JSX elements representing the required HTML nodes instead of dangerouslySetInnerHTML.
