import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getPaymentById } from "@/lib/payments/queries";
import { getOrderById } from "@/lib/orders/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function PaymentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const payment = await getPaymentById(params.id);

  if (!payment) {
    redirect("/payments");
  }

  // Verify the payment belongs to the user or user is admin
  const isAdmin = user.role === "admin";
  
  if (!isAdmin) {
    // Check if payment belongs to user by checking the order
    const order = await getOrderById(payment.orderId);
    
    if (!order || order.userId !== user.id) {
      redirect("/payments");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Payment Details</h1>
        <p className="text-gray-600">
          Payment ID: <span className="font-mono">{payment.id}</span>
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Payment Information</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono">{payment.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Midtrans Order ID:</span>
            <span className="font-mono">
              {payment.midtransOrderId || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span>{payment.paymentMethod || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <Badge
              variant={
                payment.status === "paid"
                  ? "default"
                  : payment.status === "pending"
                  ? "secondary"
                  : "destructive"
              }
            >
              {payment.status}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Gross Amount:</span>
            <span className="text-2xl font-bold">
              ${payment.grossAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Created At:</span>
            <span>{new Date(payment.createdAt).toLocaleString()}</span>
          </div>
          {payment.paidAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Paid At:</span>
              <span>{new Date(payment.paidAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => redirect("/payments")}>
          Back to Payments
        </Button>
      </div>
    </div>
  );
}
