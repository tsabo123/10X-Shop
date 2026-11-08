# 10X Shop

## About

10X Shop is a responsive storefront built as a single page application. It uses DummyJSON for public product data and browser storage for the demo cart, profile, reviews, theme, and orders. Checkout simulates an order locally and never collects payment details.

## Live Demo

[Open the 10X Shop demo](https://10x-shop-sable.vercel.app/)

## Tech Stack

- React 19 and React Router
- TypeScript with strict checking
- Vite 6
- Tailwind CSS v4 utility classes alongside component-specific CSS
- Formik and Yup for checkout form state and validation
- ESLint with TypeScript and React Hooks rules
- Prettier for readable, consistently formatted source files
- DummyJSON products API
- Browser `localStorage` for demo-only profile, cart, reviews, theme, and order data

## Features

### CORE

- Responsive React Router layout with catalog, product, cart, login, checkout, and not found routes
- Local controlled login and validated checkout forms
- Product catalog, details, cart quantities, stock checks, order total, loading/error/empty states
- Strict TypeScript and Tailwind CSS v4 styling

### FULL

- URL based search, category, sort, and 12 item pagination
- Product gallery, locally saved reviews, related products, and toast feedback
- `useReducer` cart with `10X10` discount, shipping calculation, and persistent storage
- Orders list/details, timed status changes, and reorder
- Editable profile, clear local data, persistent light/dark theme, lazy routes, and error boundary
- Local account registration, sign-in, and password reset with salted password hashes in browser storage; no account credentials are sent to a server

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run format
npm run build
npm run preview
```

## Demo sign in

Use the built-in demo account `emilys` / `emilyspass`, or create an account on the sign-up page. Registered accounts and salted password hashes are saved only in the current browser's local storage. Clearing browser data removes those accounts. This is a learning demo, not production authentication.

## Architecture

```text
src/
  contexts.tsx       Auth, cart reducer, theme, and local order state access
  hooks/             Debounced input hook
  models/            Cart calculations and order lifecycle
  pages/             Route-level catalog, product, cart, checkout, account, orders, and profile screens
  services/          DummyJSON API client, local storage, and reviews
  ui/                Shared layout, product card, toast, and route setup
  utils/             Formatting and form validation
  types.ts           Shared strict TypeScript contracts
```

Pages call typed services or shared contexts. The catalog reads search, category, sort, and page values from the URL, then requests only the needed 12 products. The cart reducer updates quantities and promotions immutably, and a provider persists every change. Orders are built from the cart and controlled checkout form, then saved locally.

## Product data

Products and categories come from [DummyJSON](https://dummyjson.com/docs/products). An internet connection is required. Authentication, checkout, inventory reservation, payment, and fulfillment are simulations only.

## Deployment

The live demo is hosted on Vercel. The included `vercel.json` rewrites application routes to `/index.html` so routes such as `/products/5` and `/cart` can be refreshed directly.

GitHub Pages deployment is also configured in `.github/workflows/deploy-pages.yml`. In the repository settings, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source. After that one-time setting, each push to `main` builds the app and deploys it to `https://tsabo123.github.io/10X-Shop/`. The workflow builds with the repository URL as its Vite base path and includes a fallback page for client-side routes.

## Credits

Implemented by the project owner with AI coding assistance. Product sample data is provided by DummyJSON; the storefront's photos and icons are loaded from their respective public sources and the Lucide icon package.
