## 2024-06-01 - Replace dangerouslySetInnerHTML with React JSX
**Vulnerability:** The `inventory/page.tsx` file used `dangerouslySetInnerHTML` to render HTML string conditionals for status badges. While currently safe because the input was based on hardcoded strings, this pattern is a high risk for XSS if future modifications introduce user input into the string.
**Learning:** Found an instance where dynamic class application was being done via raw HTML strings instead of conditionally rendering JSX components.
**Prevention:** Always use standard React JSX conditional rendering instead of constructing HTML strings and using `dangerouslySetInnerHTML`. Also remember to convert `class` to `className` when converting raw HTML to JSX.
