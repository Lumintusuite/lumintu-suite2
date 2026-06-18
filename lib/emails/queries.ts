import { getCurrentUser } from "@/lib/auth/get-user";
import type { AuthUser } from "@/lib/auth/types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/catalog/types";
import { createClient } from "@/lib/supabase/server";
import type { EmailLog } from "@/lib/supabase/types";

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

export async function listEmailLogs({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: ListParams = {}): Promise<PaginatedResult<EmailLog>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  let query = supabase
    .from("email_logs")
    .select("*, profiles(id, full_name, email)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`email_type.ilike.${term}`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as EmailLog[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listUserEmailLogs(
  userId: string,
  { page = 1, pageSize = DEFAULT_PAGE_SIZE }: Omit<ListParams, "search"> = {}
): Promise<PaginatedResult<EmailLog>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(page, pageSize);

  const { data, error, count } = await supabase
    .from("email_logs")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as EmailLog[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getEmailStats(): Promise<{
  totalEmails: number;
  sentEmails: number;
  failedEmails: number;
  pendingEmails: number;
}> {
  const supabase = await createClient();

  const [total, sent, failed, pending] = await Promise.all([
    supabase.from("email_logs").select("*", { count: "exact", head: true }),
    supabase
      .from("email_logs")
      .select("*", { count: "exact", head: true })
      .eq("status", "sent"),
    supabase
      .from("email_logs")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed"),
    supabase
      .from("email_logs")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    totalEmails: total.count ?? 0,
    sentEmails: sent.count ?? 0,
    failedEmails: failed.count ?? 0,
    pendingEmails: pending.count ?? 0,
  };
}
