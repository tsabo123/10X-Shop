# Debug Log

This log records source-review defects and their local fixes in the user's Git checkout. The fixes are uncommitted on the existing feature branch; no new history has been fabricated.

## 1. Tailwind responsive columns were overridden by component CSS

- **Symptom:** The catalog markup had Tailwind column classes, but custom `.product-grid` media rules controlled the rendered columns.
- **Evidence:** Mentor audit identified the conflict between Tailwind grid utilities and the stylesheet's component declarations. Tailwind utilities live in a later cascade layer than unlayered styles.
- **Root cause:** The custom component stylesheet was unlayered and therefore took precedence over Tailwind utilities.
- **Fix:** Fallback styles are now in `@layer components`; the catalog uses mobile-first `grid-cols-1 min-[481px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` utilities. CSS no longer sets product grid columns.
- **Verification:** Tailwind compiler generated the responsive variants; typecheck, lint, and production build pass. Browser breakpoint checks remain pending.
- **Commit:** Uncommitted local change.

## 2. Discounted cart line totals could differ by one cent

- **Symptom:** A displayed unit price multiplied by quantity could differ from the displayed line total.
- **Evidence:** Mentor audit example: a $9.99 item discounted by 10.48% displayed as $8.94 each, while the unrounded calculation for three items could display $26.83.
- **Root cause:** Unit prices were rounded only by `Intl.NumberFormat` during display, while the cart model summed fractional-cent values.
- **Fix:** `discountedPrice` now rounds each discounted unit to cents, and `Cart.subtotal()` uses that same calculation. Promo discount and final total also round to cents.
- **Verification:** Typecheck, lint, and production build pass. Browser/cart interaction remains pending.
- **Commit:** Uncommitted local change.

## 3. Empty checkout redirect did not show its message

- **Symptom:** An empty checkout navigated to `/cart` with a message in router state, but the cart page did not render that message.
- **Evidence:** Mentor audit traced the `Navigate` state in `CheckoutPage` and the missing state read in `CartPage`.
- **Root cause:** The destination page ignored `location.state`.
- **Fix:** Cart now validates the route state shape and renders its string message with `role="status"`.
- **Verification:** Typecheck, lint, and production build pass. Preview returned HTTP 200 for `/`, `/products/5`, `/cart`, `/checkout`, and an unknown path; visual browser checks remain pending.
- **Commit:** Uncommitted local change.

## Verification update

The earlier Vite `EPERM` was transient. The current project's `npm run typecheck`, `npm run lint`, and `npm run build` all pass. No deployment or push was performed.
