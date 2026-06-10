## 2024-05-24 - XSS in Swal.fire
**Vulnerability:** XSS vulnerability through direct HTML interpolation in Swal.fire.
**Learning:** Passing user-controlled data directly into the html property of SweetAlert2 causes XSS.
**Prevention:** Use the didOpen callback and DOM manipulation to safely populate input values.
