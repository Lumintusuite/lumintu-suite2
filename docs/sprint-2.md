# Sprint 2 — Categories & Products

Sprint 2 adds a product catalog with categories, file uploads, and admin management UI.

## Goals

- Categories and products database schema with RLS
- Supabase storage buckets for thumbnails and downloads
- Admin CRUD for categories and products
- Product status (draft/published), pricing, and descriptions
- Thumbnail and downloadable file uploads
- Search and pagination on admin list pages

## Deliverables

| Item | Location |
|------|----------|
| Categories migration | `supabase/migrations/002_categories_products.sql` |
| Storage buckets migration | `supabase/migrations/003_storage_buckets.sql` |
| Database types | `lib/supabase/types.ts` |
| Zod schemas | `lib/catalog/schemas.ts` |
| Server actions | `lib/catalog/actions.ts` |
| Data queries | `lib/catalog/queries.ts` |
| Admin categories UI | `app/(dashboard)/admin/categories/` |
| Admin products UI | `app/(dashboard)/admin/products/` |
| Admin components | `components/admin/` |

## Setup

1. Run migrations in order in the Supabase SQL Editor:
   - `002_categories_products.sql`
   - `003_storage_buckets.sql`
2. Confirm storage buckets `products` (public) and `downloads` (private) exist under Storage.
3. Sign in as an admin and visit `/admin/products` or `/admin/categories`.

## Routes

| Route | Access |
|-------|--------|
| `/admin/categories` | Admin — list categories |
| `/admin/categories/new` | Admin — create category |
| `/admin/categories/[id]/edit` | Admin — edit category |
| `/admin/products` | Admin — list products |
| `/admin/products/new` | Admin — create product |
| `/admin/products/[id]/edit` | Admin — edit product |

## Server actions

- `createCategory`, `updateCategory`, `deleteCategory`
- `createProduct`, `updateProduct`, `deleteProduct`, `publishProduct`

## Next steps (Sprint 3+)

- Member-facing product catalog and purchase flow
- Signed download URLs for purchased products
- Category/product public pages
- Bulk import and export

See also: [supabase-setup.md](./supabase-setup.md), [sprint-1.md](./sprint-1.md).
