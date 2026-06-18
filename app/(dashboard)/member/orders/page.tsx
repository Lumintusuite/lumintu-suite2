import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-user";
import { listUserOrders } from "@/lib/orders/queries";
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

export default async function MemberOrdersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1", 10);
  const result = await listUserOrders(user.id, { page });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">My Orders</h1>
        <p className="text-gray-600">View and manage your order history</p>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-600">No orders yet</p>
          <Button className="mt-4" onClick={() => redirect("/")}>
            Browse Products
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
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
                        onClick={() => redirect(`/orders/${order.id}`)}
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
                  onClick={() => redirect(`/orders?page=${page - 1}`)}
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
                  onClick={() => redirect(`/orders?page=${page + 1}`)}
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
