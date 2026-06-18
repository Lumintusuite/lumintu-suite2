import type { Payment } from "@/lib/supabase/types";

export type { Payment };

export type PaymentActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};
