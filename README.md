# 10X Shop

A responsive React 19 and TypeScript storefront built with Vite and Tailwind CSS v4. The shop uses DummyJSON for product data and browser storage for its local demo account, cart, theme, and orders.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

## Validate and build

```bash
npm run typecheck
npm run build
npm run preview
```

## Features

- Product catalog, category filter, text search, sorting, details, and reviews-ready DummyJSON product data
- Local demo login/profile, cart with quantity controls, `10X10` 10% promotion, and simulated checkout
- Local order history and persistent light/dark theme
- Responsive layout and SPA routes

The login and checkout are demonstrations only. No real password authentication, payment, inventory reservation, or order fulfillment occurs. Products require an internet connection to `dummyjson.com`.

## Deploy

Build with `npm run build` and publish the `dist` directory on Vercel or Netlify. Configure the host to rewrite unknown paths to `/index.html` so direct SPA routes continue to load. No deployment account or public repository is configured in this workspace.

## Project structure

```text
src/
  contexts.tsx       Auth, cart reducer, theme, and order storage
  services/          DummyJSON access and safe local storage
  ui/App.tsx          Store routes and screens
  types.ts            Shared strict TypeScript contracts
```
