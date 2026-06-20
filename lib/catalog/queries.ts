import { getCurrentUser } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/catalog/types";
import { categoryRepository, productRepository } from "@/lib/db/product-repository";
import { ProductStatus } from "@prisma/client";

export async function requireAdmin(): Promise<
  { user: AuthUser } | { error: string }
> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  if (user.role !== "admin") {
    return { error: "Admin access required." };
  }

  return { user };
}

type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

function getPaginationRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export async function listCategories({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: ListParams = {}): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  let categories = await categoryRepository.getAllCategories();

  if (search.trim()) {
    const term = search.trim().toLowerCase();
    categories = categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(term) ||
        cat.slug.toLowerCase().includes(term)
    );
  }

  const total = categories.length;
  const items = categories.slice(from, to + 1);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getCategoryById(id: string): Promise<any | null> {
  return categoryRepository.getCategoryById(id);
}

export async function listAllCategories(): Promise<any[]> {
  return categoryRepository.getAllCategories();
}

export async function listProducts({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: ListParams = {}): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  let products = await productRepository.getAllProducts();

  if (search.trim()) {
    products = await productRepository.getAllProducts({ search: search.trim() });
  }

  const total = products.length;
  const items = products.slice(from, to + 1);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProductById(
  id: string
): Promise<any | null> {
  return productRepository.getProductById(id);
}

export async function getCatalogStats(): Promise<{
  categoryCount: number;
  productCount: number;
  publishedCount: number;
}> {
  const [categoryCount, productCount, publishedCount] = await Promise.all([
    categoryRepository.getCategoriesCount(),
    productRepository.getProductsCount(),
    productRepository.getProductsCount({ status: ProductStatus.published }),
  ]);

  return {
    categoryCount,
    productCount,
    publishedCount,
  };
}
