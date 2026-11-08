# 10X Shop Audit Remediation Report

**Updated:** 8 November 2026  
**Reviewed baseline:** mentor audit of GitHub commit `21cb487` (4 November 2026)  
**Scope:** local changes in the existing Git checkout after that reviewed commit

## Audit baseline

The mentor's report scored the reviewed submission **CORE 62/83** and **FULL 32/46**. Those numbers apply to the reviewed GitHub commit, not to these newer local changes. They have not been pushed or rescored, so this report does not claim a new score or a passing verdict.

## Local fixes prepared

| Finding                                                                     | Local change                                                                                                                                                                                                                                                                  | Verification status                                                                              |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Vercel deep links returned 404                                              | Added a rewrite from application paths to `/index.html` in `vercel.json`                                                                                                                                                                                                      | Local configuration added; live deployment not changed                                           |
| README said there was no repository or deployment                           | Added About, Tech Stack, Live Demo, and accurate deployment sections with the existing public demo URL                                                                                                                                                                        | Source review                                                                                    |
| Tailwind was imported but used lightly; grid breakpoints lost to custom CSS | Added Tailwind utilities for responsive catalog, product, cart, checkout, header, footer, focus, hover, disabled, and dark states. Moved fallback component styles into `@layer components` so utility classes can override them; removed CSS-controlled product grid columns | Tailwind compiler generated the configured variants; CSS parsed; visual breakpoint check pending |
| Empty password had the wrong message                                        | Added the exact `Password is required` message; short non-empty passwords retain the minimum-length message                                                                                                                                                                   | Source review; browser check pending                                                             |
| Product cards showed only brand or category                                 | Cards now show both when a brand exists                                                                                                                                                                                                                                       | Source review; browser check pending                                                             |
| Checkout required an optional phone number                                  | Phone is validated only when entered                                                                                                                                                                                                                                          | Source review; browser check pending                                                             |
| Empty-cart redirect did not show its message                                | Cart reads and displays the route-state message                                                                                                                                                                                                                               | Source review; browser check pending                                                             |
| Product grid displayed a text loading message                               | Added 12 responsive Tailwind skeleton cards                                                                                                                                                                                                                                   | Source review; browser check pending                                                             |
| Unit and line totals could differ by one cent                               | Discounted unit prices and cart totals are rounded to cents consistently                                                                                                                                                                                                      | Typecheck passed; browser/cart scenario pending                                                  |
| Storage keys were repeated string literals                                  | Added a shared `STORAGE_KEYS` constant and reused it                                                                                                                                                                                                                          | Typecheck passed                                                                                 |
| Lint script and ESLint were missing                                         | Added ESLint flat config, TypeScript and React Hooks rules, and `npm run lint`                                                                                                                                                                                                | `npm run lint` passed with no warnings                                                           |
| Checkout did not use the required Formik/Yup workflow                       | Replaced manual field state/validation with Formik and a typed Yup schema; optional phone remains optional                                                                                                                                                                    | Typecheck and production build passed                                                            |
| Source files were difficult to read                                         | Added a shared Prettier configuration and formatted source files and project documentation                                                                                                                                                                                    | `prettier --check` passed                                                                        |
| Formik warned about an unspecified button type                              | Added explicit submit types to form submit buttons in checkout, login, signup, profile, password recovery, and review forms                                                                                                                                                   | Typecheck, lint, and production build passed                                                     |

## Verification

- `npm run typecheck`: passed after Formik/Yup integration.
- `npm run lint`: passed with no warnings.
- Prettier formatting was applied to the source files and documentation; `prettier --check` passed.
- `npm run build`: passed; Vite generated the production bundle successfully.
- Vite preview returned HTTP 200 for `/`, `/products/5`, `/cart`, `/checkout`, and an unknown path. This confirms the SPA shell fallback in local preview; live Vercel behavior remains unverified until deployment.
- Tailwind v4's compiler generated the project utilities and `hover`, `focus-visible`, `disabled`, responsive, and custom dark variants. Lightning CSS parsed the stylesheet and `vercel.json` parsed as valid JSON.
- An earlier build attempt failed with a transient Windows `EPERM`; after dependency installation, the current production build completed successfully.
- The mentor reported that the deployed root page and bundle matched the reviewed commit. The newer local code has not been deployed; deep-link behavior therefore remains unverified on the live site.
- ESLint and the `lint` script are installed/configured and pass.
- Checkout now uses Formik and Yup. The login screen remains a simple local demo form and does not need a server-backed authentication library.
- The mentor's baseline also has open process/presentation items: authentic Git history, repository naming, Issues/Projects, merged PRs, progress notes, a demo video, and the original planning deadline. These need real owner-controlled records and cannot be simulated in source code.
- Chrome/Firefox, Lighthouse, live API, and post-fix visual checks remain pending.

## Findings that need the owner or an external account

- The current folder is the existing Git checkout on `feat/routing-and-catalog`; all changes are uncommitted. The mentor's historical finding about the existing commit sequence remains open. Do not invent earlier commits, Issues, PRs, or progress notes.
- Pushing the Vercel rewrite and updating the public repository require the owner's explicit approval to publish.
- The original 23 October planning deadline cannot be changed retroactively. `PLAN.md` now records a dated recovery schedule instead of claiming the original timing was met.
- Issue/Project history, merged PR count, demo video, browser matrix, and Lighthouse measurements require real work and evidence; they are not claimed as complete.

## Three reviewed defects and their remedies

1. **Responsive grid conflict:** unlayered `.product-grid` declarations overrode Tailwind breakpoint utilities. Component styles are now layered, CSS no longer sets product grid columns, and the catalog uses mobile-first `grid-cols-1 min-[481px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` utilities.
2. **Currency rounding drift:** discounted unit prices were kept at fractional cents until display, so a displayed unit multiplied by quantity could disagree with the line total. Price calculation now rounds the unit first and the cart model uses that same value.
3. **Empty checkout redirect feedback:** checkout passed a message in router state, but the cart did not render it. Cart now reads and displays a validated message from route state.

## AI assistance

AI assistance was used for implementation and documentation edits. The project owner should review the changes and be ready to explain the Tailwind cascade-layer fix, currency rounding, and local checkout flow during the defense.
