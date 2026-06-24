## 2026-06-24 - [DOM XSS in SweetAlert2 Templates]
**Vulnerability:** XSS via raw string interpolation in Swal.fire HTML property and dangerouslySetInnerHTML usage in React badges.
**Learning:** The inventory page passed raw object properties directly into the 'html' config of Swal.fire, which evaluated user input as raw HTML. Furthermore, status badges used dangerouslySetInnerHTML unnecessarily.
**Prevention:** Avoid passing user-controlled variables into Swal.fire's 'html' property. Use the 'didOpen' callback to query the DOM and set input properties explicitly (e.g. element.value). Always prefer standard JSX for conditional component rendering over dangerouslySetInnerHTML.
