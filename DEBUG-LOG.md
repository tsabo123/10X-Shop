# Debug Log

## Bug 1: Active Navigation Link Border Hidden
- **Symptom:** The current page link (`Catalog`) in the header navigation bar did not show an active underline indicator.
- **Reproduction:** Open `/` or `/?category=fragrances` and inspect the `Catalog` link in the top header.
- **Tool Used:** Chrome DevTools (Elements / Computed Styles inspector).
- **Root Cause:** A blanket CSS rule `.navlinks a, .navlinks a.active { border-bottom: 0 !important; }` in `src/styles.css` overrode the `.active` border rule.
- **Fix:** Removed the `!important` override on `.navlinks a.active` so React Router's active class renders properly.
- **What I Learned:** Avoid using `!important` on base element selectors because it blocks state-specific utility and active classes.

## Bug 2: Cent Rounding Drift on Discounted Prices
- **Symptom:** Cart subtotal occasionally differed by $0.01 from the sum of displayed line item prices.
- **Reproduction:** Add multiple quantities of a discounted product (e.g., `discountPercentage: 7.17`) to the cart and compare line total with subtotal.
- **Tool Used:** Browser Console and unit calculation checks in `src/utils/format.ts`.
- **Root Cause:** Raw floating-point discounted prices were multiplied by quantity before rounding to cents.
- **Fix:** Rounded `discountedPrice()` to two decimal places (`Math.round(...) / 100`) before multiplying by item quantity in `Cart.ts`.
- **What I Learned:** Currency calculations in JavaScript must always round at the unit-cent level before aggregation.

## Bug 3: Stale API Response Overwriting Current Product on Fast Navigation
- **Symptom:** Rapidly switching between products caused the previous product's data to briefly flash or overwrite the newly selected product.
- **Reproduction:** Click a product card, then immediately click a related product before the first network request finishes.
- **Tool Used:** Chrome DevTools (Network tab with Slow 3G throttling).
- **Root Cause:** In-flight `fetch` requests were not canceled when the route `id` parameter changed.
- **Fix:** Added an `AbortController` inside `ProductPage`'s `useEffect` cleanup function to abort outdated requests on unmount or `id` change.
- **What I Learned:** Always pair asynchronous `useEffect` data fetching with `AbortController` cleanup to prevent race conditions.
