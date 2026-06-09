## 2024-10-24 - XSS via dangerouslySetInnerHTML
**Vulnerability:** Found dangerouslySetInnerHTML rendering raw HTML strings constructed from logic.
**Learning:** This pattern completely bypasses Reacts built-in XSS protection and allows arbitrary HTML injection if variables change.
**Prevention:** Never use dangerouslySetInnerHTML for UI badges. Always use conditional React JSX elements instead.
## 2024-10-24 - XSS via SweetAlert2 HTML injection
**Vulnerability:** Found unsanitized user inputs interpolated into Swal.fire html property strings.
**Learning:** SweetAlert2 does not sanitize the html property. Injecting user variables directly into the html string allows XSS payloads to execute when the modal is opened.
**Prevention:** Never interpolate variables into the Swal html property. Instead, render empty inputs and use the didOpen callback to safely set their .value properties via DOM manipulation.
