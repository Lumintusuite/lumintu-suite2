import type { Order, OrderItem, OrderWithItems } from "@/lib/supabase/types";

export type { Order, OrderItem, OrderWithItems };

export type OrderActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};
