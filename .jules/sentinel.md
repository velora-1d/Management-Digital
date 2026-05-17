## 2025-05-17 - Fix XSS Vulnerability in Inventory Page
**Vulnerability:** The application used `dangerouslySetInnerHTML` to render a status badge string with raw HTML classes, creating an XSS risk if the string were somehow manipulable or later modified to include user input.
**Learning:** In React components, avoid constructing raw HTML strings and using `dangerouslySetInnerHTML` for simple conditionally rendered UI components like badges.
**Prevention:** Always use standard JSX elements with explicit `className` props and render them directly (`{badge}`) to benefit from React's automatic escaping.
