## 2024-04-22 - [Remove dangerouslySetInnerHTML]
**Vulnerability:** Found `dangerouslySetInnerHTML` being used to render a badge based on conditions in `src/app/(dashboard)/inventory/page.tsx`. Although the current values were hardcoded strings, this pattern is a potential Cross-Site Scripting (XSS) risk if dynamically generated content is used in the future.
**Learning:** `dangerouslySetInnerHTML` should generally be avoided in React unless explicitly dealing with sanitized HTML input. React elements (JSX) provide built-in XSS protection and are easier to reason about.
**Prevention:** Construct React components (like `<span>`) using conditional logic to store elements in variables directly rather than constructing HTML strings and setting them via `dangerouslySetInnerHTML`.
