## 2024-06-21 - [Prevent XSS in Array Mapping]
**Vulnerability:** Found dangerouslySetInnerHTML being used to render raw HTML strings based on item condition in the inventory page.
**Learning:** Raw HTML strings can easily lead to XSS if logic changes to include user input. Using JSX directly is safer and prevents XSS by design.
**Prevention:** Avoid dangerouslySetInnerHTML completely when mapping arrays; construct safe, conditional JSX elements instead.

## 2024-06-21 - [Prevent XSS in Swal.fire]
**Vulnerability:** Found direct string interpolation of unsanitized user input (item.name, item.category) into Swal.fire html property, causing an XSS vulnerability.
**Learning:** Interpolating user inputs into HTML templates is an XSS vector and breaks UI if inputs contain double quotes.
**Prevention:** Use DOM manipulation inside the didOpen callback to set values securely rather than string interpolation.
