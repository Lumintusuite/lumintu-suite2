import type { Order, OrderItem, OrderWithItems } from "@/lib/types";

export type { Order, OrderItem, OrderWithItems } from "@/lib/types";

export type OrderActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};
