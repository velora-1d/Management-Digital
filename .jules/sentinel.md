## 2026-04-17 - Remove dangerouslySetInnerHTML Usage
**Vulnerability:** Use of `dangerouslySetInnerHTML` for rendering simple UI badges based on dynamic state in `src/app/(dashboard)/inventory/page.tsx` introduces an unnecessary Cross-Site Scripting (XSS) risk vector.
**Learning:** Even when the immediate input is seemingly safe mapped variables, using `dangerouslySetInnerHTML` is an insecure pattern and bad practice in React. Attackers could potentially manipulate the state upstream to inject malicious scripts if the input source changes in the future.
**Prevention:** Always replace `dangerouslySetInnerHTML` with standard, safe JSX elements when representing HTML nodes dynamically in React components to avoid injection vulnerabilities.
