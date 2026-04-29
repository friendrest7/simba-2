# Simba Supermarket Demo

Simba is a multilingual supermarket demo built with TanStack Router, React, and local-first persistence. It now includes a complete buyer flow, a working market rep dashboard, and a safe fallback backend using `localStorage` when Supabase is not configured.

## What works now

- Landing page with a stronger hero, branch selection, and direct path into shopping
- Product browsing with:
  - search
  - category filtering
  - price filtering
  - in-stock filtering
  - sorting
- Product detail page with:
  - image
  - name
  - price
  - category
  - description
  - stock status
  - related products
  - add to cart controls
- Cart with:
  - add item
  - remove item
  - increase quantity
  - decrease quantity
  - clear cart
  - subtotal
  - delivery fee
  - total
- Checkout with:
  - customer name
  - phone number
  - address/location
  - delivery notes
  - payment method
  - MoMo payment simulation
  - order summary
- Order confirmation with:
  - order ID
  - items
  - totals
  - customer info
  - payment status
  - delivery status
- Market rep dashboard with:
  - persistent incoming orders
  - customer and order search
  - status filter
  - payment status visibility
  - accept order
  - reject order
  - mark preparing
  - mark ready
  - mark out for delivery
  - mark delivered
  - statistics cards for total, pending, accepted, delivered, and revenue
- Multi-language UI for:
  - English
  - Kinyarwanda
  - French
  - Swahili
  - Turkish

## Persistence / backend behavior

The grading-safe default backend is local.

- Cart data is stored in `localStorage`
- Orders are stored in `localStorage`
- Order status updates are stored in `localStorage`
- Stock changes after checkout are stored in `localStorage`
- The latest order confirmation can still be opened after refresh

The order persistence layer is implemented in `src/lib/order-store.ts`.

## Run the project

```sh
npm install
npm run dev
```

## Validation commands

```sh
npm run lint
npm run build
```

## Optional Supabase setup

The app can still use Supabase for auth and related setup if you provide environment variables, but the buyer flow and dashboard do not depend on Supabase for demo grading.

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase values
3. Run the schema from `supabase/schema.sql`
4. Optionally seed demo data:

```sh
npm run backend:seed
```

## Main files for the buyer + staff flow

- `src/routes/index.tsx`
- `src/routes/products.tsx`
- `src/routes/product.$id.tsx`
- `src/routes/cart.tsx`
- `src/routes/checkout.tsx`
- `src/routes/order-confirmation.tsx`
- `src/routes/dashboard.tsx`
- `src/lib/cart.tsx`
- `src/lib/order-store.ts`
- `src/lib/i18n.tsx`
- `src/lib/i18n-extra.ts`
