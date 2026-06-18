import { Suspense } from "react";

import { CategoriesTable } from "@/components/admin/categories-table";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { CategoryFormLink } from "@/components/admin/category-form";
import { SearchInput } from "@/components/admin/search-input";
import { listCategories } from "@/lib/catalog/queries";
import { DEFAULT_PAGE_SIZE } from "@/lib/catalog/types";

export const metadata = {
  title: "Categories | Admin | Lumintu Suite",
};

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const result = await listCategories({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Categories
          </h1>
          <p className="text-muted-foreground">
            Organize products into categories.
          </p>
        </div>
        <CategoryFormLink href="/admin/categories/new" />
      </div>

      <Suspense fallback={null}>
        <SearchInput placeholder="Search categories..." />
      </Suspense>

      <CategoriesTable categories={result.items} />

      <DataTablePagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  );
}
