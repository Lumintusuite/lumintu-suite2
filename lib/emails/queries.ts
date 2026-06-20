import { getCurrentUser } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/catalog/types";
import { loggingRepository } from "@/lib/db/logging-repository";

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

export async function listEmailLogs({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: ListParams = {}): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  let emailLogs = await loggingRepository.getAllEmailLogs();

  if (search.trim()) {
    emailLogs = emailLogs.filter((log: any) => 
      log.emailType?.toLowerCase().includes(search.trim().toLowerCase())
    );
  }

  const total = emailLogs.length;
  const items = emailLogs.slice(from, to + 1);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listUserEmailLogs(
  userId: string,
  { page = 1, pageSize = DEFAULT_PAGE_SIZE }: Omit<ListParams, "search"> = {}
): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  let emailLogs = await loggingRepository.getEmailLogsByUserId(userId);

  const total = emailLogs.length;
  const items = emailLogs.slice(from, to + 1);

  return {
    items,
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
  const [totalEmails, sentEmails, failedEmails, pendingEmails] = await Promise.all([
    loggingRepository.getEmailLogsCount(),
    loggingRepository.getEmailLogsCount({ status: "sent" }),
    loggingRepository.getEmailLogsCount({ status: "failed" }),
    loggingRepository.getEmailLogsCount({ status: "pending" }),
  ]);

  return {
    totalEmails,
    sentEmails,
    failedEmails,
    pendingEmails,
  };
}
