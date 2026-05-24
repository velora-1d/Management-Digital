## 2024-05-24 - Fix XSS Vulnerability in Inventory Table
**Vulnerability:** XSS vulnerability via dangerouslySetInnerHTML and hardcoded HTML strings in src/app/(dashboard)/inventory/page.tsx.
**Learning:** Developers sometimes use raw HTML strings and dangerouslySetInnerHTML for conditional styling or badges, which opens the application to XSS if inputs or statuses are manipulated.
**Prevention:** Always use safe, conditional JSX component rendering rather than raw HTML strings and dangerouslySetInnerHTML.
