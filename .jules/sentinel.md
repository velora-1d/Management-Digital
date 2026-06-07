## 2025-02-27 - Fix multiple XSS vulnerabilities in Swal.fire

**Vulnerability:** Found multiple instances of Cross-Site Scripting (XSS) vulnerabilities where untrusted data (like item.name, user.name, etc.) was being directly interpolated into the html property of SweetAlert2 (Swal.fire). This allowed for arbitrary HTML injection and JavaScript execution if malicious input was provided.
**Learning:** React's built-in XSS protection (escaping variables in JSX) does not apply when building raw HTML strings to pass into third-party libraries like SweetAlert2. The codebase relied heavily on string interpolation for Swal modals.
**Prevention:** Instead of injecting variables directly into the html string of Swal.fire, use the didOpen callback provided by SweetAlert2. Inside didOpen, query the DOM for the input elements and securely set their value property using JavaScript (element.value = untrustedData). This prevents the data from being parsed as HTML.
