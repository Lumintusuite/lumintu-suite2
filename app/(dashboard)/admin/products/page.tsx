import { Suspense } from "react";

import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { ProductFormLink } from "@/components/admin/product-form";
import { ProductsTable } from "@/components/admin/products-table";
import { SearchInput } from "@/components/admin/search-input";
import { listProducts } from "@/lib/catalog/queries";
import { DEFAULT_PAGE_SIZE } from "@/lib/catalog/types";

export const metadata = {
  title: "Products | Admin | Lumintu Suite",
};

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.q ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const result = await listProducts({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Products
          </h1>
          <p className="text-muted-foreground">
            Manage digital products, pricing, and downloads.
          </p>
        </div>
        <ProductFormLink href="/admin/products/new" />
      </div>

      <Suspense fallback={null}>
        <SearchInput placeholder="Search products..." />
      </Suspense>

      <ProductsTable products={result.items} />

      <DataTablePagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  );
}
