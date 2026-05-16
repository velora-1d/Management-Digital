## 2024-05-18 - [Fix dangerouslySetInnerHTML XSS Vulnerability]
**Vulnerability:** Use of \`dangerouslySetInnerHTML\` to render HTML badges in React.
**Learning:** Directly rendering raw HTML strings in React using \`dangerouslySetInnerHTML\` poses a significant XSS risk if the strings are constructed from or incorporate user input. Even for static strings or conditionally selected strings like condition badges, it is considered an anti-pattern.
**Prevention:** Always use safe, declarative JSX to render elements conditionally instead of building HTML strings and using \`dangerouslySetInnerHTML\`.
