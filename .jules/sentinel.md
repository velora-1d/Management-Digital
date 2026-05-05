## 2026-05-05 - [Fix XSS vulnerability in dangerouslySetInnerHTML]
**Vulnerability:** Use of `dangerouslySetInnerHTML` for dynamic (though hardcoded) string rendering in React component (`src/app/(dashboard)/inventory/page.tsx`).
**Learning:** Although the injected strings were locally mapped condition badges, using `dangerouslySetInnerHTML` is an unnecessary security risk and anti-pattern that could lead to XSS if the logic is later adapted to accept dynamic user inputs.
**Prevention:** Replace all unnecessary uses of `dangerouslySetInnerHTML` with standard React JSX elements that automatically handle sanitization.
