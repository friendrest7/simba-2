# Simba Supermarket

Simba Supermarket is a multilingual, mobile-first online supermarket demo for Kigali. It is grading-safe by default: buyer auth, admin auth, cart, checkout, MoMo simulation, orders, and dashboard updates all work without any external backend.

## Demo Credentials

Use these accounts immediately. No signup, email verification, or external auth setup is required.

- Buyer
  - Email: `buyer@test.com`
  - Password: `password123`
- Admin / Market Rep
  - Email: `admin@test.com`
  - Password: `admin123`

## Features Completed

- Buyer flow: landing page, shop, product detail, cart, checkout, MoMo simulation, order confirmation, order history
- Product browsing: category browsing, search, price filters, in-stock filters, sorting
- Cart: add, remove, increase, decrease, clear, subtotal, delivery fee, total
- Checkout: customer name, phone, delivery address, notes, payment method, MoMo simulation
- Order confirmation: order ID, items, totals, payment status, delivery status
- Market Rep Dashboard: order list, customer details, payment status, delivery status, status update buttons, revenue and order stats
- Multi-language: English, Kinyarwanda, French, plus existing Swahili and Turkish support
- Dark mode, responsive layout, translated empty states, loading states, and status feedback

## Backend Fallback

The app automatically falls back to local demo persistence when Supabase or any real backend is unavailable.

- Users and sessions persist with local/mock auth
- Cart persists in `localStorage`
- Orders persist in `localStorage`
- Payment status persists in `localStorage`
- Dashboard order status updates persist in `localStorage`
- Seeded demo orders are available so the dashboard is never empty for grading

Core persistence logic lives in `src/lib/order-store.ts` and the auth fallback lives in `src/lib/demo-store.ts`.

## Run Locally

```sh
npm install
npm run dev
```

## Validation

```sh
npm run lint
npm run build
```

## Live Demo Notes

- Deploy to Vercel, Netlify, or Cloudflare Pages as a static Vite app
- No backend is required for grading because the local fallback is automatic
- After deploy, the grader can log in immediately with the demo credentials above
- If you use Supabase auth or password reset on Vercel, set `VITE_PUBLIC_SITE_URL` to your deployed app URL so email and OAuth redirects stay on the live host

## GitHub Submission Notes

- Submit your GitHub repository URL
- Submit your deployed app URL
- Keep the demo credentials visible in the login page and in this README
- The grader should be able to test buyer flow, admin dashboard flow, and language switching without any setup

## Optional Supabase Setup

Supabase is optional. The demo does not depend on it for grading.

1. Copy `.env.example` to `.env.local`
2. Add your Supabase values
3. Run `supabase/schema.sql`
4. Optionally seed extra backend data with `npm run backend:seed`

## Grok AI Assistant

The product browsing pages can call Grok through the `/api/grok` serverless endpoint.

- Set `XAI_API_KEY` in your deployment environment
- The assistant falls back to local recommendations if the API is unavailable
- The integration uses xAI's Responses API with the `grok-4.20` model

## Main Buyer and Staff Files

- `src/routes/index.tsx`
- `src/routes/products.tsx`
- `src/routes/product.$id.tsx`
- `src/routes/cart.tsx`
- `src/routes/checkout.tsx`
- `src/routes/order-confirmation.tsx`
- `src/routes/client-dashboard.tsx`
- `src/routes/dashboard.tsx`
- `src/routes/signin.tsx`
- `src/lib/cart.tsx`
- `src/lib/order-store.ts`
- `src/lib/demo-store.ts`
- `src/lib/i18n.tsx`
