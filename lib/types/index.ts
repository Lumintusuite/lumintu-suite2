export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enums from Prisma
export type UserRole = "admin" | "member";
export type ProductStatus = "draft" | "published";
export type OrderStatus = "pending" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired";
export type LicenseStatus = "active" | "expired" | "suspended";
export type AffiliateStatus = "pending" | "approved" | "rejected";
export type ReferralStatus = "pending" | "approved";
export type EmailStatus = "pending" | "sent" | "failed";

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  categoryId: string | null;
  thumbnailPath: string | null;
  filePath: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
}

export type ProductWithCategory = Product & { category: Category | null };

// Order types
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  product?: Product | null;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
}

export type OrderWithItems = Order & { items: OrderItem[] };

// Payment types
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  order?: Order | null;
}

// License types
export interface LicenseActivation {
  id: string;
  licenseId: string;
  ipAddress: string | null;
  userAgent: string | null;
  activatedAt: string;
}

export interface License {
  id: string;
  userId: string;
  productId: string;
  orderId: string | null;
  licenseKey: string;
  status: LicenseStatus;
  expiresAt: string | null;
  maxActivations: number;
  createdAt: string;
  updatedAt: string;
  activations?: LicenseActivation[];
  product?: Product | null;
  order?: Order | null;
}

// Affiliate types
export interface AffiliateNotification {
  id: string;
  affiliateId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralClick {
  id: string;
  affiliateId: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface Referral {
  id: string;
  affiliateId: string;
  orderId: string;
  commissionAmount: number;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
  affiliate?: {
    id: string;
    affiliateCode: string;
    commissionRate: number;
    status: AffiliateStatus;
  } | null;
  order?: Order | null;
}

export interface Affiliate {
  id: string;
  userId: string;
  affiliateCode: string;
  status: AffiliateStatus;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
}
