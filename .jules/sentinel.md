## 2024-05-19 - XSS in dangerouslySetInnerHTML
**Vulnerability:** XSS vulnerability caused by constructing HTML strings and injecting them using `dangerouslySetInnerHTML`.
**Learning:** Even if data seems safe, using `dangerouslySetInnerHTML` with string concatenation is an anti-pattern that can lead to XSS if the data source becomes tainted. React JSX should always be used for conditional rendering.
**Prevention:** Avoid `dangerouslySetInnerHTML` completely unless absolutely necessary for rendering sanitized rich text. Use standard conditional rendering with JSX elements.
