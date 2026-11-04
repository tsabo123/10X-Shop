# 10X Shop Project Plan

## Goal

Deliver the required CORE storefront first, then the useful FULL additions described in the graduation project PRD.

## CORE

- React 19, Vite, strict TypeScript, and Tailwind CSS v4 setup
- Responsive layout, navigation, catalog, product detail, and local demo login
- Cart reducer with immediate header count, quantity changes, removal, and `10X10`
- Validated checkout simulation with confirmation and empty-cart behavior
- DummyJSON loading, error, and empty states
- Typecheck and production build

## FULL

- Search, category filtering, sorting, profile, local orders, and theme persistence
- Reviews-ready API data and optional catalog enhancements
- Lazy route loading, error boundary, and performance review

## Release steps

1. Install dependencies and run `npm run typecheck`.
2. Run `npm run build` and resolve all reported issues.
3. Check the core shopping flow at mobile and desktop widths.
4. Create a public GitHub repository and deploy to Vercel or Netlify when credentials and approval are available.
5. Record the final verification and deployment links in `REPORT.md`.
