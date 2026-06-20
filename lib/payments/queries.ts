import { getCurrentUser } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/catalog/types";
import { paymentRepository } from "@/lib/db/payment-repository";
import { PaymentStatus } from "@prisma/client";

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

export async function listPayments({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: ListParams = {}): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  let payments = await paymentRepository.getAllPayments();

  const total = payments.length;
  const items = payments.slice(from, to + 1);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listUserPayments(
  userId: string,
  { page = 1, pageSize = DEFAULT_PAGE_SIZE }: Omit<ListParams, "search"> = {}
): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  const allPayments = await paymentRepository.getAllPayments();
  const userPayments = allPayments.filter(
    (p) => p.order.userId === userId
  );

  const total = userPayments.length;
  const items = userPayments.slice(from, to + 1);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPaymentById(
  id: string
): Promise<any | null> {
  return paymentRepository.getPaymentById(id);
}

export async function getPaymentByOrderId(
  orderId: string
): Promise<any | null> {
  return paymentRepository.getPaymentByOrderId(orderId);
}

export async function getPaymentStats(): Promise<{
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
}> {
  const [totalPayments, paidPayments, pendingPayments, failedPayments] = await Promise.all([
    paymentRepository.getPaymentsCount(),
    paymentRepository.getPaymentsCount({ status: PaymentStatus.paid }),
    paymentRepository.getPaymentsCount({ status: PaymentStatus.pending }),
    paymentRepository.getPaymentsCount({ status: PaymentStatus.failed }),
  ]);

  const totalRevenue = await paymentRepository.getTotalRevenue();

  return {
    totalPayments,
    paidPayments,
    pendingPayments,
    failedPayments,
    totalRevenue: Number(totalRevenue),
  };
}
