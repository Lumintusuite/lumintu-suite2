"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createOrderSchema,
  mapZodErrors,
  updateOrderStatusSchema,
} from "@/lib/orders/schemas";
import type { OrderActionState } from "@/lib/orders/types";
import { requireAuthenticated, requireAdmin } from "@/lib/orders/queries";
import { orderRepository } from "@/lib/db/order-repository";
import { productRepository } from "@/lib/db/product-repository";
import { OrderStatus } from "@prisma/client";

const CHECKOUT_PATH = "/checkout";
const ORDERS_PATH = "/orders";
const ADMIN_ORDERS_PATH = "/admin/orders";

export async function createOrder(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const auth = await requireAuthenticated();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const itemsJson = formData.get("items");
  
  if (!itemsJson || typeof itemsJson !== "string") {
    return { error: "Order items are required." };
  }

  let items;
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: "Invalid order items format." };
  }

  const parsed = createOrderSchema.safeParse({ items });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  // Calculate total and verify products exist and are published
  let total = 0;
  const productIds = parsed.data.items.map((item) => item.productId);

  const products = await Promise.all(
    productIds.map((id) => productRepository.getProductById(id))
  );

  if (products.some((p) => !p)) {
    return { error: "Failed to verify products." };
  }

  const productMap = new Map(
    products.map((p) => [p!.id, p])
  );

  for (const item of parsed.data.items) {
    const product = productMap.get(item.productId);

    if (!product) {
      return { error: `Product with ID ${item.productId} not found.` };
    }

    if (product.status !== "published") {
      return { error: `Product ${item.productId} is not available for purchase.` };
    }

    total += Number(product.price) * item.quantity;
  }

  // Create order
  let order;
  try {
    order = await orderRepository.createOrder({
      userId: auth.user.id,
      total,
      status: OrderStatus.completed,
      items: parsed.data.items.map((item) => ({
        productId: item.productId,
        price: Number(productMap.get(item.productId)!.price),
        quantity: item.quantity,
      })),
    });
  } catch (error: any) {
    return { error: error.message || "Failed to create order." };
  }

  revalidatePath(ORDERS_PATH);
  revalidatePath(ADMIN_ORDERS_PATH);
  redirect(`/checkout/success?orderId=${order.id}`);
}

export async function createPendingOrder(
  items: Array<{ productId: string; price: number; quantity: number }>
): Promise<{ orderId: string; total: number } | { error: string }> {
  const auth = await requireAuthenticated();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const parsed = createOrderSchema.safeParse({ items });

  if (!parsed.success) {
    return { error: "Invalid order items." };
  }

  // Calculate total and verify products exist and are published
  let total = 0;
  const productIds = parsed.data.items.map((item) => item.productId);

  const products = await Promise.all(
    productIds.map((id) => productRepository.getProductById(id))
  );

  if (products.some((p) => !p)) {
    return { error: "Failed to verify products." };
  }

  const productMap = new Map(
    products.map((p) => [p!.id, p])
  );

  for (const item of parsed.data.items) {
    const product = productMap.get(item.productId);

    if (!product) {
      return { error: `Product with ID ${item.productId} not found.` };
    }

    if (product.status !== "published") {
      return { error: `Product ${item.productId} is not available for purchase.` };
    }

    total += Number(product.price) * item.quantity;
  }

  // Create order with pending status
  let order;
  try {
    order = await orderRepository.createOrder({
      userId: auth.user.id,
      total,
      status: OrderStatus.pending,
      items: parsed.data.items.map((item) => ({
        productId: item.productId,
        price: Number(productMap.get(item.productId)!.price),
        quantity: item.quantity,
      })),
    });
  } catch (error: any) {
    return { error: error.message || "Failed to create order." };
  }

  revalidatePath(ORDERS_PATH);
  revalidatePath(ADMIN_ORDERS_PATH);

  return { orderId: order.id, total };
}

export async function updateOrderStatus(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!id) {
    return { error: "Order ID is required." };
  }

  const parsed = updateOrderStatusSchema.safeParse({ status });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  try {
    await orderRepository.updateOrder(id, {
      status: parsed.data.status as OrderStatus,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to update order status." };
  }

  revalidatePath(ADMIN_ORDERS_PATH);
  revalidatePath(`${ADMIN_ORDERS_PATH}/${id}`);
  return { success: "Order status updated." };
}

export async function cancelOrder(
  id: string
): Promise<{ error?: string; success?: string }> {
  const auth = await requireAuthenticated();

  if ("error" in auth) {
    return { error: auth.error };
  }

  if (!id) {
    return { error: "Order ID is required." };
  }

  const order = await orderRepository.getOrderById(id);
  if (!order) {
    return { error: "Order not found." };
  }

  if (order.userId !== auth.user.id) {
    return { error: "You can only cancel your own orders." };
  }

  if (order.status !== OrderStatus.pending) {
    return { error: "Only pending orders can be cancelled." };
  }

  try {
    await orderRepository.updateOrder(id, {
      status: OrderStatus.cancelled,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to cancel order." };
  }

  revalidatePath(ORDERS_PATH);
  return { success: "Order cancelled." };
}
