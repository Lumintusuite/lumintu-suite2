import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID."),
  grossAmount: z.coerce
    .number({ error: "Amount must be a valid number." })
    .min(0, "Amount cannot be negative.")
    .max(999999999.99, "Amount is too large."),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(["pending", "paid", "failed", "expired"], {
    error: "Status must be pending, paid, failed, or expired.",
  }),
  midtransOrderId: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export const webhookSchema = z.object({
  transaction_id: z.string(),
  order_id: z.string(),
  gross_amount: z.string(),
  payment_type: z.string(),
  transaction_status: z.string(),
  fraud_status: z.string().optional(),
  signature_key: z.string(),
});

export type CreatePaymentFormValues = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusFormValues = z.infer<typeof updatePaymentStatusSchema>;
export type WebhookData = z.infer<typeof webhookSchema>;

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
