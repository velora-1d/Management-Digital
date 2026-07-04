## 2025-02-27 - Fix potential XSS via dangerouslySetInnerHTML
**Vulnerability:** Found `dangerouslySetInnerHTML` being used to render HTML strings for condition badges in `src/app/(dashboard)/inventory/page.tsx`.
**Learning:** Even if currently rendering hardcoded strings, using `dangerouslySetInnerHTML` is an anti-pattern that can lead to XSS if the data source ever includes un-sanitized user input. It breaks the "secure by default" concept in React.
**Prevention:** Always use standard React components (JSX) instead of raw HTML string injection.
