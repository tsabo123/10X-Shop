# Debug Log

This log records confirmed findings from the available project review. The workspace has no Git history, so fixes cannot be linked to commits. Browser and runtime findings below are identified as such; unperformed checks are not reported as completed.

## 1. Mobile navigation covered the page and showed unwanted separators

- **Symptom:** The supplied 416px screenshot showed the opened navigation covering the hero content and horizontal lines between menu entries.
- **Reproduction:** Open the navigation at a viewport no wider than 480px.
- **Tool/evidence:** The supplied browser screenshot and the mobile navigation CSS rules.
- **Root cause:** The mobile menu used absolute positioning and each menu link had a bottom border.
- **Fix:** The mobile menu now participates in normal document flow, and the navigation link borders are removed.
- **Learning:** Mobile navigation layout should be checked for both menu visibility and how it moves the content below it.
- **Commit:** Not available; this workspace is not a Git repository.
- **Verification:** Source updated; a new browser screenshot has not been captured.

## 2. Strict TypeScript caught an unused shipping contract

- **Symptom:** `npm run typecheck` reported `ShippingInfo is declared but its value is never read` after the shipping contract was added.
- **Reproduction:** Run `npm run typecheck` with `noUnusedLocals` enabled.
- **Tool/evidence:** TypeScript compiler output.
- **Root cause:** The checkout form imported the contract before adding it to the saved order.
- **Fix:** Checkout now builds a typed `ShippingInfo` object and saves it on the order.
- **Learning:** Shared contracts should be connected to their complete data flow before considering an implementation finished.
- **Commit:** Not available; this workspace is not a Git repository.
- **Verification:** The latest `npm run typecheck` passed.

## 3. Production build is blocked by workspace file access

- **Symptom:** `npm run build` passes TypeScript and Vite stops with `EPERM` while resolving `src/main.tsx`.
- **Reproduction:** Run `npm run build` in the current managed workspace.
- **Tool/evidence:** Vite build output.
- **Root cause:** Windows denied Vite's `realpath` access in this execution environment; this is an environment-level failure and does not identify a source error.
- **Fix/status:** No source change can resolve the access denial. The project owner must run the build from a normal local terminal or the workspace access restriction must be corrected.
- **Learning:** Keep compiler validation separate from environment-level bundler failures.
- **Commit:** Not available; this workspace is not a Git repository.
