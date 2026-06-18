# Supabase Setup

## 1. Create a project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **anon public** key from Settings → API.

## 2. Environment variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Set:

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key

## 3. Run migrations

Open the Supabase SQL Editor and run migrations in order:

1. `supabase/migrations/001_profiles.sql` — profiles and roles
2. `supabase/migrations/002_categories_products.sql` — categories and products
3. `supabase/migrations/003_storage_buckets.sql` — `products` and `downloads` buckets

Migration 001 creates:

- `user_role` enum (`admin`, `member`)
- `profiles` table linked to `auth.users`
- Trigger to auto-create a profile on signup (default role: `member`)
- Row Level Security policies

## 4. Authentication settings

In Supabase Dashboard → Authentication → URL Configuration:

| Setting | Development value |
|---------|-------------------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback`, `http://localhost:3000/reset-password` |

Enable **Email** provider under Authentication → Providers.

## 5. Create an admin user

After registering a user via the app:

```sql
update public.profiles
set role = 'admin'
where id = 'USER_UUID_HERE';
```

Replace `USER_UUID_HERE` with the user's UUID from Authentication → Users.

## 6. Local Supabase CLI (optional)

If you use the Supabase CLI locally:

```bash
npx supabase init
npx supabase db push
```

Migration files live in `supabase/migrations/`.
