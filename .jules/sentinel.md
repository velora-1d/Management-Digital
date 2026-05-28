## 2026-05-28 - [Sentinel] Fixed XSS vulnerability in React rendering
**Vulnerability:** XSS vulnerability found in `src/app/(dashboard)/inventory/page.tsx` where raw HTML strings for condition badges were rendered using the dangerous React anti-pattern `dangerouslySetInnerHTML`.
**Learning:** The previous implementation manually constructed HTML strings and used `dangerouslySetInnerHTML` to inject them, which is a known vector for Cross-Site Scripting (XSS) if data sources are manipulated. React's architecture strongly discourages this.
**Prevention:** Always use safe, native JSX component rendering for dynamic UI elements instead of constructing raw HTML strings and using `dangerouslySetInnerHTML`.
