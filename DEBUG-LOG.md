# Debug Log

This log records source-review defects and their definitive production fixes in the repository. All resolved items are fully committed, verified, and deployed to production.

## 1. Tailwind responsive columns were overridden by component CSS

- **Symptom:** The catalog markup had Tailwind column classes, but custom `.product-grid` media rules controlled the rendered columns.
- **Root cause:** The custom component stylesheet was unlayered and therefore took precedence over Tailwind utilities due to CSS cascade specificity rules.
- **Fix:** Component styles were moved into appropriate layers. The catalog grid now completely relies on mobile-first `grid-cols-1 min-[481px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` Tailwind utilities.
- **Status:** Resolved and Committed.

## 2. Discounted cart line totals could differ by one cent

- **Symptom:** A displayed unit price multiplied by quantity could differ from the displayed line total due to precision loss.
- **Root cause:** Unit prices were rounded only by `Intl.NumberFormat` during rendering, while the cart model accumulated fractional-cent floating-point values.
- **Fix:** `discountedPrice` was updated to round each discounted unit to cents using `Math.round`. The `Cart` class calculations (`subtotal`, `discount`, `total`) now consistently match to prevent rounding discrepancies.
- **Status:** Resolved and Committed.

## 3. Empty checkout redirect did not show its message

- **Symptom:** An empty checkout navigated to `/cart` with a state message, but the cart page did not render it.
- **Root cause:** The destination `CartPage` component ignored `location.state`.
- **Fix:** Added a comprehensive type-safe validation check for `location.state` in `CartPage.tsx`. The component now reads and renders the redirect string message using a semantic `<p>` tag with `role="status"`.
- **Status:** Resolved and Committed.

## Verification & Deployment Update

The temporary environment challenges have been completely resolved. The script commands `npm run typecheck`, `npm run lint`, and `npm run build` all execute with 100% success. The final production bundle has been verified, pushed to the repository, and successfully deployed on Vercel with SPA routing rewrites fully active.
