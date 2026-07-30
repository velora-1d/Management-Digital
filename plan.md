1. **Fix XSS vulnerability in `src/app/(dashboard)/inventory/page.tsx`**
   - Replace the `dangerouslySetInnerHTML` usage with a safe React component rendering.
   - Specifically, refactor the `badge` variable to store a React Node (JSX) instead of an HTML string.
   - Update the `<td>` to render the React Node directly.
2. **Review and test changes**
   - Run linter and tests to ensure the changes don't break functionality.
3. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
4. **Submit PR**
   - Create a PR with title "🛡️ Sentinel: [HIGH] Fix XSS vulnerability in inventory page" and description with the required format.
