## 2024-05-31 - [Custom SQL Parser Differential Vulnerabilities]
**Vulnerability:** Implementing a custom, regex and string-manipulation based SQL parser (e.g., using loop state-machines) to secure a restore endpoint using raw `.sql` execution.
**Learning:** Naive custom parsers fail to account for complex database engine specifics like PostgreSQL's `E'...'` backslash escaping syntax. An attacker can craft inputs that trick the custom parser into thinking a malicious command is inside a harmless string, while the real database executes it, completely bypassing the security check (Parser Differential Attack).
**Prevention:** Never attempt to hand-roll SQL parsers or write security validation regex for raw SQL dumps. Always use established, battle-tested Abstract Syntax Tree (AST) parser libraries, or avoid executing raw SQL dumps from web endpoints entirely in favor of constrained DTO imports.

## 2024-05-31 - [dangerouslySetInnerHTML with Mapped Variables]
**Vulnerability:** Cross-Site Scripting (XSS) via `dangerouslySetInnerHTML` in React components, even when the injected string comes from a conditionally mapped variable rather than direct user input.
**Learning:** Using `dangerouslySetInnerHTML` is inherently risky as future code modifications might inadvertently introduce un-sanitized user input into the string builder. React's JSX natively escapes content and is the secure default.
**Prevention:** Refactor `dangerouslySetInnerHTML` injections by replacing the hardcoded HTML strings with standard React JSX elements (`<span className="...">...</span>`) that are evaluated conditionally and rendered natively.
