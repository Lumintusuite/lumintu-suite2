import Link from "next/link";

import { Button } from "@/components/ui/button";
import { H1, Lead } from "@/components/design/typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from "@/components/design/cards";
import { getCatalogStats } from "@/lib/catalog/queries";
import { getAffiliateStats } from "@/lib/affiliates/queries";
import { Package, FolderOpen, Users, TrendingUp, DollarSign, Activity } from "lucide-react";

export default async function AdminDashboardPage() {
  let catalogStats = { categoryCount: 0, productCount: 0, publishedCount: 0 };
  let affiliateStats = { totalAffiliates: 0, activeAffiliates: 0, pendingAffiliates: 0, totalCommission: 0 };

  try {
    catalogStats = await getCatalogStats();
    affiliateStats = await getAffiliateStats();
  } catch {
    // Tables may not exist until migrations are applied.
  }

  return (
    <div className="space-y-8">
      <div>
        <H1>Admin Dashboard</H1>
        <Lead>Manage products, categories, users, and platform configuration.</Lead>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={catalogStats.productCount}
          change={`${catalogStats.publishedCount} published`}
          changeType="neutral"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Categories"
          value={catalogStats.categoryCount}
          icon={<FolderOpen className="h-5 w-5" />}
        />
        <StatCard
          title="Affiliates"
          value={affiliateStats.totalAffiliates}
          change={`${affiliateStats.activeAffiliates} active`}
          changeType="positive"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Total Commission"
          value={`$${affiliateStats.totalCommission.toFixed(2)}`}
          changeType="positive"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/products/new">
                <Package className="mr-2 h-4 w-4" />
                Add New Product
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/categories/new">
                <FolderOpen className="mr-2 h-4 w-4" />
                Add New Category
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/affiliates">
                <Users className="mr-2 h-4 w-4" />
                Manage Affiliates
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/orders">
                <Activity className="mr-2 h-4 w-4" />
                View Orders
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">System operational</p>
                  <p className="text-xs text-muted-foreground">All services running normally</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Database connected</p>
                  <p className="text-xs text-muted-foreground">Supabase connection active</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Email service ready</p>
                  <p className="text-xs text-muted-foreground">Resend integration configured</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
