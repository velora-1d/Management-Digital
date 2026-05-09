## 2024-05-31 - [Preventing XSS in Next.js/React]
**Vulnerability:** A React component (`src/app/(dashboard)/inventory/page.tsx`) used `dangerouslySetInnerHTML` to render conditionally built HTML strings for status badges.
**Learning:** Even if current inputs to `dangerouslySetInnerHTML` are statically defined strings in a map function, it establishes a dangerous pattern that can easily become an XSS vector if dynamic user input is later introduced into the component's state or props.
**Prevention:** Always prefer using standard React JSX elements to construct UI components dynamically instead of concatenating raw HTML strings and injecting them via `dangerouslySetInnerHTML`. This ensures React's built-in escaping mechanisms remain active.
