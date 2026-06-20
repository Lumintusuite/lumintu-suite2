import { getCurrentUser } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/catalog/types";
import { orderRepository } from "@/lib/db/order-repository";
import { OrderStatus } from "@prisma/client";

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

export async function listOrders({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: ListParams = {}): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  let orders = await orderRepository.getAllOrders();

  const total = orders.length;
  const items = orders.slice(from, to + 1);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listUserOrders(
  userId: string,
  { page = 1, pageSize = DEFAULT_PAGE_SIZE }: Omit<ListParams, "search"> = {}
): Promise<PaginatedResult<any>> {
  const { from, to } = getPaginationRange(page, pageSize);

  let orders = await orderRepository.getAllOrders({ userId });

  const total = orders.length;
  const items = orders.slice(from, to + 1);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getOrderById(
  id: string
): Promise<any | null> {
  return orderRepository.getOrderById(id);
}

export async function getOrderStats(): Promise<{
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}> {
  const [totalOrders, pendingOrders, completedOrders, cancelledOrders] = await Promise.all([
    orderRepository.getOrdersCount(),
    orderRepository.getOrdersCount({ status: OrderStatus.pending }),
    orderRepository.getOrdersCount({ status: OrderStatus.completed }),
    orderRepository.getOrdersCount({ status: OrderStatus.cancelled }),
  ]);

  const completedOrdersList = await orderRepository.getAllOrders({ status: OrderStatus.completed });
  const totalRevenue = completedOrdersList.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue,
  };
}
