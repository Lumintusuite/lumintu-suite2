import type { Payment } from "@/lib/types";

export type { Payment } from "@/lib/types";

export type PaymentActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};
