import { getCurrentUser } from "@/lib/auth/get-user";
import type { AuthUser } from "@/lib/auth/types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/catalog/types";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderWithItems } from "@/lib/supabase/types";

export async function requireAuthenticated(): Promise<
  { user: AuthUser } | { error: string }
> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  return { user };
}

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

export async function listOrders({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: ListParams = {}): Promise<PaginatedResult<Order>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as Order[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listUserOrders(
  userId: string,
  { page = 1, pageSize = DEFAULT_PAGE_SIZE }: Omit<ListParams, "search"> = {}
): Promise<PaginatedResult<Order>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  const { data, error, count } = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as Order[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getOrderById(
  id: string
): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        products (id, name, slug)
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as OrderWithItems | null) ?? null;
}

export async function getOrderStats(): Promise<{
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}> {
  const supabase = await createClient();

  const [total, pending, completed, cancelled, revenue] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled"),
    supabase
      .from("orders")
      .select("total")
      .eq("status", "completed"),
  ]);

  const totalRevenue = (revenue.data ?? []).reduce(
    (sum, order) => sum + (order.total ?? 0),
    0
  );

  return {
    totalOrders: total.count ?? 0,
    pendingOrders: pending.count ?? 0,
    completedOrders: completed.count ?? 0,
    cancelledOrders: cancelled.count ?? 0,
    totalRevenue,
  };
}
