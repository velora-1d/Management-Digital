## 2025-04-10 - Fix XSS Risk via dangerouslySetInnerHTML
**Vulnerability:** The codebase used `dangerouslySetInnerHTML` in a React component (`src/app/(dashboard)/inventory/page.tsx`) to dynamically render HTML badge tags based on string concatenation.
**Learning:** Using `dangerouslySetInnerHTML` with dynamic data (especially data retrieved from a database or user input) is a significant security anti-pattern. It bypasses React's built-in XSS protection and exposes the application to Cross-Site Scripting attacks.
**Prevention:** Always prefer native React JSX element rendering over dynamically generating raw HTML strings. By using conditional rendering and assigning React elements directly, we ensure all content is properly escaped by React before being inserted into the DOM.
