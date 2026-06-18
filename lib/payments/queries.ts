import { getCurrentUser } from "@/lib/auth/get-user";
import type { AuthUser } from "@/lib/auth/types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/catalog/types";
import { createClient } from "@/lib/supabase/server";
import type { Payment } from "@/lib/supabase/types";

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

export async function listPayments({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: ListParams = {}): Promise<PaginatedResult<Payment>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  let query = supabase
    .from("payments")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as Payment[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listUserPayments(
  userId: string,
  { page = 1, pageSize = DEFAULT_PAGE_SIZE }: Omit<ListParams, "search"> = {}
): Promise<PaginatedResult<Payment>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  const { data, error, count } = await supabase
    .from("payments")
    .select("*, orders!inner(user_id)", { count: "exact" })
    .eq("orders.user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as Payment[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPaymentById(
  id: string
): Promise<Payment | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Payment | null) ?? null;
}

export async function getPaymentByOrderId(
  orderId: string
): Promise<Payment | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Payment | null) ?? null;
}

export async function getPaymentStats(): Promise<{
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
}> {
  const supabase = await createClient();

  const [total, paid, pending, failed, revenue] = await Promise.all([
    supabase.from("payments").select("*", { count: "exact", head: true }),
    supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid"),
    supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed"),
    supabase.from("payments").select("gross_amount").eq("status", "paid"),
  ]);

  const totalRevenue = (revenue.data ?? []).reduce(
    (sum, payment) => sum + (payment.gross_amount ?? 0),
    0
  );

  return {
    totalPayments: total.count ?? 0,
    paidPayments: paid.count ?? 0,
    pendingPayments: pending.count ?? 0,
    failedPayments: failed.count ?? 0,
    totalRevenue,
  };
}
