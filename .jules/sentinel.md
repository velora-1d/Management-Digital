## 2025-06-03 - [Fix XSS via dangerouslySetInnerHTML]
**Vulnerability:** Found `dangerouslySetInnerHTML` used to render statically derived but unescaped HTML strings in `src/app/(dashboard)/inventory/page.tsx`.
**Learning:** Relying on `dangerouslySetInnerHTML` even for non-user-input strings is an anti-pattern. If future refactoring introduces user data to the component, it creates a silent XSS sink.
**Prevention:** Always use safe, conditional React JSX rendering instead of constructing raw HTML strings and injecting them via `dangerouslySetInnerHTML`.
