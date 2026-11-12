# Project Report — 10X Shop

## Planned vs. Completed
All planned CORE and FULL features were implemented:
- **Catalog & Product:** URL-synchronized search, category filtering, sorting, 12-item pagination, gallery, related items, and local reviews.
- **Cart & Checkout:** Immutable `useReducer` cart state, stock validation, `10X10` discount code, free shipping threshold ($100), and Formik/Yup validated checkout.
- **Account & Orders:** Local simulated authentication, protected checkout/profile routes, persistent dark/light theme, and automated order status timeline.

## Technical Results & Metrics
- **TypeScript & Linting:** `npm run typecheck` and `npm run lint` pass with 0 errors under strict mode.
- **Production Bundle:** Main JS bundle is `305.60 kB` (`95.91 kB` gzipped), with secondary routes code-split via `React.lazy`.
- **Deployment:** Live production application hosted on Vercel with SPA route rewrites enabled.

## Known Limitations
- **Simulated Backend:** Product data comes from DummyJSON (read-only). Authentication, orders, and reviews are stored locally in browser `localStorage` and do not sync across devices.
- **No Real Payment Processing:** Checkout simulates order creation without collecting payment card details.
