# Simba Supabase Backend

This app uses Supabase as the backend when these frontend environment variables exist:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=your-facebook-app-id
```

Without those values, the app falls back to local demo storage.

## Setup

1. Create a Supabase project.
2. Open the Supabase SQL editor and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local`.
4. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Add `SUPABASE_SERVICE_ROLE_KEY` locally only for seeding. Never expose it in deployed frontend env vars.
6. Run:

```sh
npm run backend:seed
```

The seed command loads the product catalog from `src/data/simba_products.json`, inserts products into `public.products`, creates the pickup branches, and fills `public.branch_inventory`.

## Google Sign-In

In Google Cloud Console, create an OAuth Web client and add your app origin, for example:

```text
http://localhost:5173
https://your-production-domain.com
```

Put the Web client ID in `VITE_GOOGLE_CLIENT_ID`.

In Supabase, enable Google under Authentication providers. Use the same Google OAuth client details there if you want Google users stored in Supabase Auth.

## Facebook Sign-In

For the recommended backend-backed flow, enable Facebook under Supabase Authentication providers and add your Facebook app credentials in Supabase.

For local demo auth without Supabase, set:

```env
VITE_FACEBOOK_APP_ID=your-facebook-app-id
```

In Meta for Developers, add your local and production domains to the Facebook app settings so the SDK can run on those origins.

## Tables

- `profiles`: app user profile, role, and assigned branches.
- `products`: product catalog used for backend inventory references.
- `branches`: pickup branch list.
- `branch_inventory`: branch-specific product stock.
- `orders`: pickup orders.
- `order_items`: ordered products.
- `branch_reviews`: customer branch reviews.

Row level security is enabled. Customers can manage their own account/orders, everyone can read public products/inventory/reviews, and manager/staff inventory/order updates are limited to assigned branches.
