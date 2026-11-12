# Project Plan — 10X Shop

## Scope & Goals
Build a responsive single-page e-commerce storefront using React 19, TypeScript, React Router, and Tailwind CSS v4, backed by the DummyJSON API and browser `localStorage`.

## 3-Week Development Schedule

### Week 1: Setup, Architecture & Catalog (CORE)
- Initialize Vite + React 19 + TypeScript (strict mode) and Tailwind CSS v4.
- Set up React Router layout (`Header`, `Outlet`, `Footer`), 404 fallback, and `ScrollToTop`.
- Implement Catalog page with DummyJSON API integration, search debounce, category filter, sorting, and pagination via URL search params.

### Week 2: Product Details, Cart & Authentication
- Build Product detail page with image gallery, stock status badges, quantity stepper, and local reviews.
- Implement `CartContext` using `useReducer` with immutable updates, stock caps, `10X10` promo discount, and shipping calculation.
- Create controlled Login and Checkout forms with validation and protected route redirection.

### Week 3: Orders, Profile, Optimization & Deployment
- Add Orders history and Order detail pages with time-based status progression (`Processing` → `Shipped` → `Delivered`) and Reorder.
- Implement Profile management, persistent Dark/Light theme, `ErrorBoundary`, and lazy-loaded routes.
- Configure SPA routing rewrites and deploy production build to Vercel.

## Work Breakdown Structure (WBS)

| Module | Tasks | Estimated Hours | Definition of Done |
|---|---|---|---|
| Setup & Routing | Vite, TS strict, Router, Layout, 404 | 6h | All routes render cleanly with zero TS errors |
| Catalog & Product | API client, type guards, URL filters, gallery | 14h | Pagination, search, sort, and stock limits work |
| Cart & Checkout | `useReducer`, promo code, Formik validation | 12h | Cart persists in `localStorage`; checkout creates order |
| Orders & Profile | Status timer, reorder, theme toggle | 8h | Orders update status; theme persists across reloads |
| QA & Deployment | Responsive check, ESLint, Vercel deploy | 6h | Production URL loads all routes with status 200 |

## Risks & Mitigation
1. **API Rate Limits or Network Errors:** Mitigated with `AbortController` cleanup, in-memory request caching, and user-facing Retry states.
2. **Invalid or Corrupted `localStorage` Data:** Mitigated by reading all stored values as `unknown` and validating shapes with runtime type guards.
3. **Client-Side Route 404s on Page Refresh:** Mitigated by adding `vercel.json` rewrites pointing all paths to `/index.html`.
