## 2024-05-22 - XSS Risk in Inventory Page
**Vulnerability:** Use of `dangerouslySetInnerHTML` for condition badges in the inventory table.
**Learning:** Raw HTML strings were used where standard JSX could easily provide the same styling conditionally without security risks.
**Prevention:** Avoid `dangerouslySetInnerHTML` when displaying data, prefer safe React component composition.
