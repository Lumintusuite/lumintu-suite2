import Link from "next/link";

import { Button } from "@/components/ui/button";
import { H1, Lead } from "@/components/design/typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from "@/components/design/cards";
import { Package, Key, Users, DollarSign, ShoppingCart, Settings } from "lucide-react";

export default function MemberDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <H1>Welcome back</H1>
        <Lead>Your member dashboard and account overview.</Lead>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Products"
          value="0"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Licenses"
          value="0"
          icon={<Key className="h-5 w-5" />}
        />
        <StatCard
          title="Orders"
          value="0"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          title="Affiliate Earnings"
          value="$0.00"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common member tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/member/licenses">
                <Key className="mr-2 h-4 w-4" />
                View My Licenses
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/member/orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Order History
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/member/affiliate">
                <Users className="mr-2 h-4 w-4" />
                Affiliate Dashboard
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/member/account">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Explore features available to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Browse Products</p>
                  <p className="text-xs text-muted-foreground">Explore our catalog of digital products</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Join Affiliate Program</p>
                  <p className="text-xs text-muted-foreground">Earn commissions by referring customers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Manage Your Licenses</p>
                  <p className="text-xs text-muted-foreground">View and manage your purchased licenses</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
