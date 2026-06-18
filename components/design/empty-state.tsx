import { Button } from "@/components/ui/button";
import { Card } from "@/components/design/cards";
import { H3, Body } from "@/components/design/typography";
import { Package, ShoppingCart, Key, Users, Plus } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon || <Package className="h-8 w-8 text-muted-foreground" />}
      </div>
      <H3 className="mb-2">{title}</H3>
      <Body className="mb-6 max-w-md text-muted-foreground">{description}</Body>
      {action && (
        <Button asChild>
          <a href={action.href}>
            <Plus className="mr-2 h-4 w-4" />
            {action.label}
          </a>
        </Button>
      )}
    </div>
  );
}

export function EmptyProducts() {
  return (
    <EmptyState
      icon={<Package className="h-8 w-8 text-muted-foreground" />}
      title="No products yet"
      description="Get started by adding your first product to the catalog."
      action={{
        label: "Add Product",
        href: "/admin/products/new",
      }}
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={<ShoppingCart className="h-8 w-8 text-muted-foreground" />}
      title="No orders yet"
      description="Orders will appear here when customers make purchases."
    />
  );
}

export function EmptyLicenses() {
  return (
    <EmptyState
      icon={<Key className="h-8 w-8 text-muted-foreground" />}
      title="No licenses yet"
      description="Licenses will be generated automatically when you purchase products."
    />
  );
}

export function EmptyAffiliate() {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="Not an affiliate yet"
      description="Join our affiliate program to earn commissions by referring customers."
      action={{
        label: "Join Affiliate Program",
        href: "/member/affiliate",
      }}
    />
  );
}

export function EmptyAffiliates() {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="No affiliates yet"
      description="Affiliates will appear here when users register for the program."
      action={{
        label: "View Affiliate Applications",
        href: "/admin/affiliates",
      }}
    />
  );
}

export function EmptyReferrals() {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="No referrals yet"
      description="Referrals will appear here when affiliates generate sales."
    />
  );
}

export function EmptyCategories() {
  return (
    <EmptyState
      icon={<Package className="h-8 w-8 text-muted-foreground" />}
      title="No categories yet"
      description="Create categories to organize your products."
      action={{
        label: "Add Category",
        href: "/admin/categories/new",
      }}
    />
  );
}

export function EmptyEmails() {
  return (
    <EmptyState
      icon={<Package className="h-8 w-8 text-muted-foreground" />}
      title="No email logs yet"
      description="Email activity will be logged here when emails are sent."
      action={{
        label: "Send Test Email",
        href: "/admin/emails",
      }}
    />
  );
}
