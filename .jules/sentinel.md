## 2024-05-18 - [Fix dangerouslySetInnerHTML risk in React]
**Vulnerability:** Use of dangerouslySetInnerHTML injecting conditional badges derived from item conditions.
**Learning:** Relying on 'dangerouslySetInnerHTML' introduces severe XSS risks in React applications even when initially passing static strings, as future code modifications that pipe dynamically sourced text could unknowingly open injection pathways.
**Prevention:** Replace 'dangerouslySetInnerHTML' string HTML construction logic with standard React JSX object assignment, securing properties using 'className' and utilizing React's native safe interpolation.
