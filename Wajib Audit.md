You are a Senior System Architect and Code Auditor.

TASK:
Perform a deep, granular, menu-by-menu audit between:

Project A: Laravel (MH Assaodah)
Project B: Next.js + Neon PostgreSQL (migration version)

IMPORTANT:

- Ignore CMS module
- Ignore Website Profile
- Focus only on internal dashboard system

GOAL:
Ensure 100% functional equivalence per menu and per page.

AUDIT STRATEGY:
Do NOT perform global comparison.
Audit strictly per module, per menu, per page.

---

## STEP 1 — IDENTIFY ALL ACTIVE MENUS (excluding CMS & Website)

List all menus in Project A:

- Dashboard
- Students
- PPDB
- SPP
- Payroll
- Reports
- Users
- Roles & Permissions
- Logs
- Settings
- dan lain sebagainya jangan sampai ada yang terlewat

(Adjust based on actual system)

For each menu:

- List submenus
- List pages
- List modals
- List action buttons

---

## STEP 2 — MENU-BY-MENU FUNCTIONAL AUDIT

For EACH MENU perform:

A. UI Audit

- Are all buttons present?
- Are labels identical?
- Are modal dialogs implemented?
- Are table columns identical?
- Are filters identical?
- Are search functions identical?
- Are pagination rules identical?

B. Action Validation
For every button:

- What endpoint does it call?
- Does it return correct status?
- Does it mutate database correctly?
- Does it handle validation errors?
- Does it update UI state correctly?

C. Flow Validation

- Create new record flow
- Edit record flow
- Delete record flow
- View details flow
- Export/report flow (if exists)

D. Edge Case Testing

- Empty data state
- Invalid input
- Duplicate entry
- Permission denial
- Network failure handling

---

## STEP 3 — DATABASE COMPARISON (PER MODULE)

For each module:

- Compare tables used
- Compare column names
- Compare data types
- Compare foreign keys
- Compare indexes
- Compare constraints
- Validate transaction safety (especially SPP & Payroll)

Flag:

- Missing column
- Logic deviation
- Different calculation method
- Inconsistent status flag

---

## STEP 4 — BUSINESS LOGIC VALIDATION

For financial modules (SPP, Payroll, PPDB):

Validate:

- Calculation formulas identical?
- Discount logic identical?
- Arrears logic identical?
- Status transitions identical?
- Data mutation sequence identical?
- Atomic transaction handling safe?

If any difference exists:
Flag as HIGH RISK.

---

## STEP 5 — PERMISSION & RBAC VALIDATION

Compare:

- Role structure
- Middleware logic
- Access control
- Route protection
- Button visibility per role

---

## STEP 6 — REPORT OUTPUT

For EACH MENU output:

- Feature Match Percentage
- Logic Match Percentage
- Schema Match Percentage
- Flow Match Percentage
- Missing Components
- Risk Level (Low / Medium / High)
- Critical Differences
- Recommendation

At the end, provide:

1. Overall Functional Similarity %
2. Financial Module Safety Score
3. Migration Completion Score
4. Production Readiness Level

STRICT RULES:

- Do not assume equivalence.
- Do not skip small buttons.
- Every clickable element must be validated.
- Flag any silent logic deviation.
- Prioritize financial accuracy over UI similarity.

Goal: Achieve true functional parity before production deployment.
