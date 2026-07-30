## 2024-05-18 - XSS in SweetAlert2 HTML property
**Vulnerability:** User input was directly interpolated into the `html` property of `Swal.fire`, allowing XSS if the input contained malicious HTML/scripts.
**Learning:** The `html` property in SweetAlert2 is equivalent to `innerHTML` and is vulnerable to XSS. Also, `dangerouslySetInnerHTML` was used unnecessarily for static badge colors.
**Prevention:** Never interpolate dynamic user data directly into `html`. Always use the `didOpen` callback to safely populate input values via DOM manipulation (e.g., `document.getElementById().value`). Avoid `dangerouslySetInnerHTML` for simple component rendering.
