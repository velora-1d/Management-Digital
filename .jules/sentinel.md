## 2025-02-15 - Remove dangerouslySetInnerHTML anti-pattern
**Vulnerability:** Use of `dangerouslySetInnerHTML` in React to render logic-derived HTML strings.
**Learning:** Even when derived entirely from static application logic (no direct user input), using `dangerouslySetInnerHTML` sets a poor security precedent, violates secure coding practices, and risks XSS if future modifications inject dynamic variables into the strings.
**Prevention:** Always use standard React JSX elements to construct UI conditionally instead of building HTML string blobs and injecting them unsafely.
