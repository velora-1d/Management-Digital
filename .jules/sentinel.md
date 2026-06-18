## 2026-06-18 - [XSS via raw HTML strings and dangerouslySetInnerHTML]
**Vulnerability:** Found dangerouslySetInnerHTML and raw HTML construction in React component rendering.
**Learning:** Using raw HTML strings even for internal badges is an anti-pattern that creates potential XSS vectors if dynamic data is later introduced into them. Code review also noted XSS vector inside SweetAlert2 HTML string interpolation.
**Prevention:** Always use standard React JSX components and className for styling instead of raw HTML strings. For SweetAlert, populate inputs safely via DOM manipulation in didOpen rather than string interpolation.
