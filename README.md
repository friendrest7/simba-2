This is the Project From simba and it works perfectly

## Backend

The app uses Supabase as its backend when Supabase environment variables are set. Run `supabase/schema.sql` in your Supabase SQL editor, copy `.env.example` to `.env.local`, fill in the Supabase and Google values, then seed products and branch inventory:

```sh
npm run backend:seed
```

See `supabase/README.md` for the full backend and Google sign-in setup.
