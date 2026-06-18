import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-user";
import { getOrderById } from "@/lib/orders/queries";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const orderId = searchParams.orderId;

  if (!orderId) {
    redirect("/orders");
  }

  const order = await getOrderById(orderId);

  if (!order) {
    redirect("/orders");
  }

  // Verify the order belongs to the user
  if (order.user_id !== user.id) {
    redirect("/orders");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border p-8 text-center">
          <div className="mb-4 flex justify-center">
            <svg
              className="h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Order Successful!</h1>
          <p className="mb-6 text-gray-600">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono font-semibold">{order.id}</p>
            <p className="mt-2 text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">
              ${order.total.toFixed(2)}
            </p>
          </div>
          <div className="flex gap-4">
            <a
              href={`/orders/${order.id}`}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
            >
              View Order
            </a>
            <a
              href="/orders"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center hover:bg-gray-50"
            >
              My Orders
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
