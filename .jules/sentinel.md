## 2024-03-24 - [Avoid dangerouslySetInnerHTML]
**Vulnerability:** XSS risk due to using `dangerouslySetInnerHTML` to render badges.
**Learning:** React components should use native JSX for dynamic rendering instead of `dangerouslySetInnerHTML`.
**Prevention:** Avoid `dangerouslySetInnerHTML` for simple HTML that can be expressed in JSX.
