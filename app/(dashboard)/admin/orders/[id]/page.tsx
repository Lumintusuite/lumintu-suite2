import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getOrderById } from "@/lib/orders/queries";
import { updateOrderStatus } from "@/lib/orders/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  const order = await getOrderById(params.id);

  if (!order) {
    redirect("/admin/orders");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Order Details</h1>
        <p className="text-gray-600">
          Order ID: <span className="font-mono">{order.id}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Order Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">User ID:</span>
              <span className="font-mono">{order.userId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
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
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="text-2xl font-bold">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>

          <form
            action={async (formData: FormData) => {
              "use server";
              await updateOrderStatus({}, formData);
            }}
            className="mt-6 space-y-4"
          >
            <input type="hidden" name="id" value={order.id} />
            <div>
              <label className="mb-2 block text-sm font-medium">
                Update Status
              </label>
              <Select name="status" defaultValue={order.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Update Status</Button>
          </form>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderItems.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell className="text-right">
                    ${item.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => redirect("/admin/orders")}>
          Back to Orders
        </Button>
      </div>
    </div>
  );
}
