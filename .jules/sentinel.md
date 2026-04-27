## 2024-10-27 - Remove dangerouslySetInnerHTML in Inventory Page
**Vulnerability:** A React component (`src/app/(dashboard)/inventory/page.tsx`) was using `dangerouslySetInnerHTML` to render HTML string badges for item conditions.
**Learning:** While the strings were conditionally assigned and not immediately exploitable by user input, `dangerouslySetInnerHTML` represents a lingering high-risk Cross-Site Scripting (XSS) vulnerability. If future developers alter the conditionals to inject variables into those strings, XSS is instantly introduced.
**Prevention:** Avoid `dangerouslySetInnerHTML` altogether. Replace static HTML string generation with native React JSX conditional rendering (`<span className="...">...</span>`) to ensure safety and maintainability.
