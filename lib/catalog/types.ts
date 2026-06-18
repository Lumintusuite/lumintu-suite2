import type { Category, Product, ProductStatus, ProductWithCategory } from "@/lib/supabase/types";

export type { Category, Product, ProductStatus, ProductWithCategory };

export type CatalogActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const DEFAULT_PAGE_SIZE = 10;
