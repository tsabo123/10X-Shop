# 10X Shop Project Plan

## Goal and scope

Build the CORE shopping path first, then add the FULL catalog, product, cart, order, profile, and optimization features from Appendix A. Payment processing and server authentication remain outside scope because the PRD defines this as a local learning simulation.

## Work breakdown

| Epic | Scope | Estimate | Definition of done |
|---|---|---:|---|
| Setup and types | React 19, Vite, strict TypeScript, Tailwind v4, shared contracts | 3 hours | Typecheck passes and shared models are used across pages |
| Auth and layout | Header, footer, routes, local login, protected checkout | 3 hours | Login/logout and route behavior work without page reloads |
| Catalog | DummyJSON, categories, search, sorting, URL state, paging | 5 hours | URL restores filters and each API page requests 12 products |
| Product | Details, gallery, stock, reviews, related products | 4 hours | Invalid ids show not found; reviews persist locally |
| Cart and checkout | Reducer, promo, shipping, form validation, confirmation | 4 hours | Cart survives refresh and valid checkout saves an order |
| Orders and profile | Order status, detail/reorder, profile, theme, clear data | 4 hours | Orders and profile remain available after reload |
| Quality and docs | Typecheck, build, responsive/browser checks, project reports | 4 hours | Results and outstanding limitations are recorded honestly |

## Risks and mitigations

- DummyJSON or network access may fail: surface loading/error/retry states and keep cart/order data local.
- Browser storage may contain an older shape: validate stored data and migrate previous cart/order rows.
- A deployment host may not support SPA routes by default: configure an `/index.html` rewrite before release.
- Device/browser behavior may differ: use the compatibility matrix to record real checks before claiming support.

## Release steps

1. Run `npm run typecheck` and fix all TypeScript errors.
2. Run `npm run build`; review any environment-specific build failures separately from source errors.
3. Check the complete shopping flow at mobile and desktop widths, then run cross-browser and accessibility checks.
4. Create a GitHub repository and deploy only after the project owner supplies the needed account access and explicitly approves public release.
5. Record verification, live links, and remaining work in `REPORT.md`.
