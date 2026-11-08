# 10X Shop Project Plan

## Goal and scope

Build the CORE shopping path first, then add the FULL catalog, product, cart, order, profile, and optimization features from Appendix A. Payment processing and server authentication remain outside scope because the PRD defines this as a local learning simulation.

## Work breakdown

| Epic               | Scope                                                            | Estimate | Definition of done                                          |
| ------------------ | ---------------------------------------------------------------- | -------: | ----------------------------------------------------------- |
| Setup and types    | React 19, Vite, strict TypeScript, Tailwind v4, shared contracts |  3 hours | Typecheck passes and shared models are used across pages    |
| Auth and layout    | Header, footer, routes, local login, protected checkout          |  3 hours | Login/logout and route behavior work without page reloads   |
| Catalog            | DummyJSON, categories, search, sorting, URL state, paging        |  5 hours | URL restores filters and each API page requests 12 products |
| Product            | Details, gallery, stock, reviews, related products               |  4 hours | Invalid ids show not found; reviews persist locally         |
| Cart and checkout  | Reducer, promo, shipping, form validation, confirmation          |  4 hours | Cart survives refresh and valid checkout saves an order     |
| Orders and profile | Order status, detail/reorder, profile, theme, clear data         |  4 hours | Orders and profile remain available after reload            |
| Quality and docs   | Typecheck, build, responsive/browser checks, project reports     |  4 hours | Results and outstanding limitations are recorded honestly   |

## Risks and mitigations

- DummyJSON or network access may fail: surface loading/error/retry states and keep cart/order data local.
- Browser storage may contain an older shape: validate stored data and migrate previous cart/order rows.
- A deployment host may not support SPA routes by default: configure an `/index.html` rewrite before release.
- Device/browser behavior may differ: use the compatibility matrix to record real checks before claiming support.

## Release steps

1. Run `npm run typecheck` and `npm run lint`; fix all reported errors.
2. Run `npm run build`; review any environment-specific build failures separately from source errors.
3. Check the complete shopping flow at mobile and desktop widths, then run cross-browser and accessibility checks.
4. Use the existing GitHub repository; push and deploy only after the project owner explicitly approves public release.
5. Record verification, live links, and remaining work in `REPORT.md`.

## Audit recovery schedule

This schedule was added on 6 November 2026 after the mentor's audit. The PRD's 23 October planning deadline has already passed; this plan records recovery work and does not claim that the original deadline was met.

| Recovery week      | Focus                                                                                                                                               | Definition of done                                                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Week 1 · 6–12 Nov  | CORE fixes: SPA rewrite, checkout/cart feedback, validation, price calculations, Tailwind cascade and responsive utilities; add lint and Formik/Yup | `npm run typecheck` and `npm run lint` pass; production build succeeds in a normal local environment; high-priority routes are manually checked                    |
| Week 2 · 13–19 Nov | UI and browser review: 375px, tablet, desktop; Chrome and Firefox; keyboard focus and error states                                                  | Compatibility matrix records actual results; no unsupported test is marked passed; remaining issues are documented                                                 |
| Week 3 · 20–26 Nov | Submission evidence and external process                                                                                                            | README/REPORT reflect verified state; demo video and progress evidence are recorded if required; repository and deployment updates happen only with owner approval |

### Recovery risks

- **Live routes and release:** `vercel.json` is prepared locally. A deployed fix needs an approved push/deployment and a direct deep-link check.
- **Build environment:** A previous Vite build attempt failed with Windows `EPERM`; the current production build passes. Recheck after future dependency changes.
- **Git evidence:** The original repository checkout is now open and contains the mentor-audited history. Do not fabricate or rewrite earlier work; keep new changes truthful and reviewable.
- **Schedule:** The original date cannot be repaired retroactively. Confirm any new grading deadline with the mentor.
