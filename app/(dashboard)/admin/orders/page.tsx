import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-user";
import { listOrders, getOrderStats } from "@/lib/orders/queries";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.profile.role !== "admin") {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1", 10);
  const [result, stats] = await Promise.all([
    listOrders({ page }),
    getOrderStats(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Orders</h1>
        <p className="text-gray-600">Manage all orders</p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.pendingOrders}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.completedOrders}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold">
            ${stats.totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-600">No orders yet</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {order.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => redirect(`/admin/orders/${order.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {result.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {page > 1 && (
                <Button
                  variant="outline"
                  onClick={() => redirect(`/admin/orders?page=${page - 1}`)}
                >
                  Previous
                </Button>
              )}
              <span className="flex items-center px-4">
                Page {page} of {result.totalPages}
              </span>
              {page < result.totalPages && (
                <Button
                  variant="outline"
                  onClick={() => redirect(`/admin/orders?page=${page + 1}`)}
                >
                  Next
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
