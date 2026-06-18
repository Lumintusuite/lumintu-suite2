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
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();

  // Calculate total and verify products exist and are published
  let total = 0;
  const productIds = parsed.data.items.map((item) => item.productId);

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price, status")
    .in("id", productIds);

  if (productsError || !products) {
    return { error: "Failed to verify products." };
  }

  const productMap = new Map(
    products.map((p: { id: string; price: number; status: string }) => [
      p.id,
      p,
    ])
  );

  for (const item of parsed.data.items) {
    const product = productMap.get(item.productId);

    if (!product) {
      return { error: `Product with ID ${item.productId} not found.` };
    }

    if (product.status !== "published") {
      return { error: `Product ${item.productId} is not available for purchase.` };
    }

    total += product.price * item.quantity;
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: auth.user.id,
      total,
      status: "completed",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: orderError?.message ?? "Failed to create order." };
  }

  // Create order items
  const orderItems = parsed.data.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    price: productMap.get(item.productId)!.price as number,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    // Rollback order if items fail
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: itemsError.message };
  }

  revalidatePath(ORDERS_PATH);
  revalidatePath(ADMIN_ORDERS_PATH);
  redirect(`/checkout/success?orderId=${order.id}`);
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

  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
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

  const supabase = await createClient();

  // Verify order belongs to user
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("user_id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !order) {
    return { error: fetchError?.message ?? "Order not found." };
  }

  if (order.user_id !== auth.user.id) {
    return { error: "You can only cancel your own orders." };
  }

  if (order.status !== "pending") {
    return { error: "Only pending orders can be cancelled." };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(ORDERS_PATH);
  return { success: "Order cancelled." };
}
