export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "member";
export type ProductStatus = "draft" | "published";
export type OrderStatus = "pending" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired";
export type LicenseStatus = "active" | "expired" | "suspended";
export type AffiliateStatus = "pending" | "approved" | "rejected";
export type ReferralStatus = "pending" | "approved";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          status: ProductStatus;
          thumbnail_path: string | null;
          file_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          price?: number;
          status?: ProductStatus;
          thumbnail_path?: string | null;
          file_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          status?: ProductStatus;
          thumbnail_path?: string | null;
          file_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: OrderStatus;
          total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: OrderStatus;
          total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: OrderStatus;
          total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          price: number;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          price?: number;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          price?: number;
          quantity?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          midtrans_order_id: string | null;
          payment_method: string | null;
          gross_amount: number;
          status: PaymentStatus;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          midtrans_order_id?: string | null;
          payment_method?: string | null;
          gross_amount?: number;
          status?: PaymentStatus;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          midtrans_order_id?: string | null;
          payment_method?: string | null;
          gross_amount?: number;
          status?: PaymentStatus;
          paid_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      licenses: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          order_id: string | null;
          license_key: string;
          status: LicenseStatus;
          expires_at: string | null;
          activation_count: number;
          max_activations: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          order_id?: string | null;
          license_key: string;
          status?: LicenseStatus;
          expires_at?: string | null;
          activation_count?: number;
          max_activations?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          order_id?: string | null;
          license_key?: string;
          status?: LicenseStatus;
          expires_at?: string | null;
          activation_count?: number;
          max_activations?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "licenses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "licenses_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "licenses_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      license_activations: {
        Row: {
          id: string;
          license_id: string;
          device_name: string | null;
          domain_name: string | null;
          ip_address: string | null;
          activated_at: string;
        };
        Insert: {
          id?: string;
          license_id: string;
          device_name?: string | null;
          domain_name?: string | null;
          ip_address?: string | null;
          activated_at?: string;
        };
        Update: {
          id?: string;
          license_id?: string;
          device_name?: string | null;
          domain_name?: string | null;
          ip_address?: string | null;
          activated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "license_activations_license_id_fkey";
            columns: ["license_id"];
            isOneToOne: false;
            referencedRelation: "licenses";
            referencedColumns: ["id"];
          },
        ];
      };
      affiliates: {
        Row: {
          id: string;
          user_id: string;
          affiliate_code: string;
          status: AffiliateStatus;
          commission_rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          affiliate_code: string;
          status?: AffiliateStatus;
          commission_rate?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          affiliate_code?: string;
          status?: AffiliateStatus;
          commission_rate?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "affiliates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      referral_clicks: {
        Row: {
          id: string;
          affiliate_id: string;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          affiliate_id: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          affiliate_id?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referral_clicks_affiliate_id_fkey";
            columns: ["affiliate_id"];
            isOneToOne: false;
            referencedRelation: "affiliates";
            referencedColumns: ["id"];
          },
        ];
      };
      referrals: {
        Row: {
          id: string;
          affiliate_id: string;
          order_id: string;
          commission_amount: number;
          status: ReferralStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          affiliate_id: string;
          order_id: string;
          commission_amount?: number;
          status?: ReferralStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          affiliate_id?: string;
          order_id?: string;
          commission_amount?: number;
          status?: ReferralStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_id_fkey";
            columns: ["affiliate_id"];
            isOneToOne: false;
            referencedRelation: "affiliates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      affiliate_notifications: {
        Row: {
          id: string;
          affiliate_id: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          affiliate_id: string;
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          affiliate_id?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "affiliate_notifications_affiliate_id_fkey";
            columns: ["affiliate_id"];
            isOneToOne: false;
            referencedRelation: "affiliates";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      product_status: ProductStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      license_status: LicenseStatus;
      affiliate_status: AffiliateStatus;
      referral_status: ReferralStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type Payment = Tables<"payments">;
export type License = Tables<"licenses">;
export type LicenseActivation = Tables<"license_activations">;
export type Affiliate = Tables<"affiliates">;
export type ReferralClick = Tables<"referral_clicks">;
export type Referral = Tables<"referrals">;
export type AffiliateNotification = Tables<"affiliate_notifications">;

export type ProductWithCategory = Product & {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    products: Pick<Product, "id" | "name" | "slug">;
  })[];
};
