import { getCurrentUser } from "@/lib/auth/get-user";
import type { AuthUser } from "@/lib/auth/types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/catalog/types";
import { createClient } from "@/lib/supabase/server";
import type { Category, ProductWithCategory } from "@/lib/supabase/types";

export async function requireAdmin(): Promise<
  { user: AuthUser } | { error: string }
> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  if (user.profile.role !== "admin") {
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
}: ListParams = {}): Promise<PaginatedResult<Category>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  let query = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`name.ilike.${term},slug.ilike.${term}`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as Category[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Category | null) ?? null;
}

export async function listAllCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Category[];
}

export async function listProducts({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: ListParams = {}): Promise<PaginatedResult<ProductWithCategory>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`name.ilike.${term},slug.ilike.${term}`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as ProductWithCategory[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProductById(
  id: string
): Promise<ProductWithCategory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ProductWithCategory | null) ?? null;
}

export async function getCatalogStats(): Promise<{
  categoryCount: number;
  productCount: number;
  publishedCount: number;
}> {
  const supabase = await createClient();

  const [categories, products, published] = await Promise.all([
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  return {
    categoryCount: categories.count ?? 0,
    productCount: products.count ?? 0,
    publishedCount: published.count ?? 0,
  };
}
