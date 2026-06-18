import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCatalogStats } from "@/lib/catalog/queries";

export default async function AdminDashboardPage() {
  let stats = { categoryCount: 0, productCount: 0, publishedCount: 0 };

  try {
    stats = await getCatalogStats();
  } catch {
    // Tables may not exist until migrations are applied.
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Admin overview
        </h1>
        <p className="text-muted-foreground">
          Manage products, categories, users, and platform configuration.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Catalog items and downloads</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.productCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.publishedCount} published
            </p>
            <Link
              href="/admin/products"
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              Manage products
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Product organization</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.categoryCount}</p>
            <Link
              href="/admin/categories"
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              Manage categories
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System status</CardTitle>
            <CardDescription>Platform health</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-emerald-600">Operational</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
