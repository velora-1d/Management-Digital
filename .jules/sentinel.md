## 2024-05-18 - [Weak Randomness for Password Generation]
**Vulnerability:** Found Math.random() being used to generate passwords during a reset, which is cryptographically insecure and predictable.
**Learning:** In Node.js environments, standard PRNGs like Math.random() should never be used for security-sensitive operations such as password generation or tokens.
**Prevention:** Always use cryptographically secure primitives from node:crypto, such as randomInt() or randomBytes(), when generating secrets or passwords.
