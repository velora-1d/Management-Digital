## YYYY-MM-DD - [Remove dynamically created HTML and dangerouslySetInnerHTML for XSS prevention]
**Vulnerability:** A cross-site scripting (XSS) vulnerability related to `dangerouslySetInnerHTML` in React where raw HTML string tags were passed and generated based on conditions.
**Learning:** Found string concatenation dynamically rendering HTML, passing it inside `dangerouslySetInnerHTML`. An attacker could exploit this by managing to inject malicious inputs causing malicious code execution inside a user's browser, leading to XSS vulnerabilities and exposing information.
**Prevention:** Eliminate `dangerouslySetInnerHTML` by moving rendering tags securely back to basic React logic component renderings (conditional React elements rendering) directly without raw string mapping.
