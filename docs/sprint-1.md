# Sprint 1 — Authentication & Dashboard Foundation

Sprint 1 establishes authentication, role-based access, and protected dashboard shells for Lumintu Suite.

## Goals

- Supabase-backed authentication (email/password)
- Login, register, and forgot-password flows
- Admin and member roles with middleware protection
- Separate dashboard layouts for each role

## Deliverables

| Item | Location |
|------|----------|
| Supabase clients | `lib/supabase/` |
| Auth server actions | `lib/auth/actions.ts` |
| Role types & helpers | `lib/auth/types.ts`, `lib/auth/get-user.ts` |
| Database migration | `supabase/migrations/001_profiles.sql` |
| Middleware | `middleware.ts` |
| Auth pages | `app/(auth)/` |
| Admin dashboard | `app/(dashboard)/admin/` |
| Member dashboard | `app/(dashboard)/member/` |
| Auth callback | `app/auth/callback/route.ts` |

## Setup

1. Copy `.env.local.example` to `.env.local` and add your Supabase credentials.
2. Run the SQL migration in the Supabase SQL Editor (see [supabase-setup.md](./supabase-setup.md)).
3. Enable Email auth in Supabase Dashboard → Authentication → Providers.
4. Set Site URL to `http://localhost:3000` and add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/reset-password`
5. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

## Routes

| Route | Access |
|-------|--------|
| `/` | Public landing |
| `/login` | Public (redirects if authenticated) |
| `/register` | Public (redirects if authenticated) |
| `/forgot-password` | Public |
| `/reset-password` | Public (password reset from email link) |
| `/admin` | Admin only |
| `/member` | Member only (admins redirected to `/admin`) |

## Tech stack

- Next.js App Router (Server Actions, middleware)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Auth + Postgres (profiles table with `role`)

## Next steps (Sprint 2+)

- Member management UI for admins
- Profile settings page
- Email verification UX polish
- Audit logging

See also: [supabase-setup.md](./supabase-setup.md), [auth.md](./auth.md).
