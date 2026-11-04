# 10X Shop

10X Shop is a responsive storefront built as a single page application with React 19, TypeScript, Vite, and Tailwind CSS v4. It uses DummyJSON for public product data and browser storage for the demo cart, profile, reviews, theme, and orders. Checkout simulates an order locally and never collects payment details.

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
- Local sign-up and password-recovery demo screens; no credentials are stored or emailed

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
npm run build
npm run preview
```

## Demo sign in

Use username `emilys` and password `emilyspass`, or any non-empty username with a password of at least six characters. This is a local learning demo; no password is sent to a server.

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

## Deploy

After a successful `npm run build`, publish the `dist` directory on Vercel or Netlify and configure the host to rewrite unknown routes to `/index.html`. No public deployment or repository has been created.

## Credits

Implemented by the project owner with AI coding assistance. Product sample data is provided by DummyJSON; the storefront's photos and icons are loaded from their respective public sources and the Lucide icon package.
