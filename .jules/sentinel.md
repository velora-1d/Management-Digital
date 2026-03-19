## 2025-02-28 - XSS Risk from dangerouslySetInnerHTML in React Rendering
**Vulnerability:** A cross-site scripting (XSS) risk was present because a UI element ("badge" for inventory item conditions) was being constructed via raw HTML string concatenation and rendered using `dangerouslySetInnerHTML`.
**Learning:** Using `dangerouslySetInnerHTML` bypasses React's built-in protections against DOM-based XSS attacks. Even if the data currently injected is controlled, the pattern introduces an architectural security flaw, making it easier for future changes to inadvertently introduce a payload.
**Prevention:** Avoid `dangerouslySetInnerHTML` whenever possible. Always construct UI elements natively as React JSX components so that any dynamic input is properly escaped by default.
