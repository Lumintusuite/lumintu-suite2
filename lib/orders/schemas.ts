import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID."),
  price: z.coerce
    .number({ error: "Price must be a valid number." })
    .min(0, "Price cannot be negative.")
    .max(999999.99, "Price is too large."),
  quantity: z.coerce
    .number({ error: "Quantity must be a valid number." })
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1.")
    .max(100, "Quantity cannot exceed 100."),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item.")
    .max(50, "Order cannot contain more than 50 items."),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "completed", "cancelled"], {
    error: "Status must be pending, completed, or cancelled.",
  }),
});

export type OrderItemFormValues = z.infer<typeof orderItemSchema>;
export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusFormValues = z.infer<typeof updateOrderStatusSchema>;

export function mapZodErrors(
  error: z.ZodError
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];

    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}
