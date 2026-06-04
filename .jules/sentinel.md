## 2024-05-24 - [Fix XSS in SweetAlert2]
**Vulnerability:** Unsanitized user input interpolated into SweetAlert2 HTML.
**Learning:** Direct HTML interpolation in SweetAlert2 allows for XSS if input contains HTML tags.
**Prevention:** Use didOpen callback to safely populate input values via DOM manipulation.
