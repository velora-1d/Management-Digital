## 2024-04-16 - Prevent XSS in SweetAlert2 Dialogs
**Vulnerability:** XSS vulnerability in SweetAlert2 (`Swal.fire`) dialogues caused by unsafe interpolation of user data into the `html` configuration option.
**Learning:** React escapes HTML by default, but libraries that construct HTML from strings (like SweetAlert2's `html` property) bypass this protection.
**Prevention:** Always use safe DOM manipulation (e.g., modifying element properties inside the `didOpen` hook) instead of string interpolation for user-provided data in components that parse HTML strings.
