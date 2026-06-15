## 2025-02-18 - [XSS] Fix dangerouslySetInnerHTML in Inventory Badges
**Vulnerability:** Found `dangerouslySetInnerHTML` rendering dynamically built HTML strings for status badges in the inventory table.
**Learning:** While the strings were currently built from static values internally, using `dangerouslySetInnerHTML` in React components creates unnecessary XSS sinks that can be exploited if dynamic data is ever introduced.
**Prevention:** Always map status fields directly to native React JSX elements (e.g., `<span>`) rather than concatenating HTML strings and rendering them via `dangerouslySetInnerHTML`.
