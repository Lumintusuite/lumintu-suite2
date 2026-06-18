import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-user";
import { createPendingOrder } from "@/lib/orders/actions";
import { createPayment } from "@/lib/payments/actions";
import { getMidtransClientKey } from "@/lib/payments/midtrans";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { items?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const itemsJson = searchParams.items;

  if (!itemsJson) {
    redirect("/");
  }

  // Parse items
  let items;
  try {
    items = JSON.parse(itemsJson);
  } catch {
    redirect("/");
  }

  // Create pending order
  const orderResult = await createPendingOrder(items);

  if ("error" in orderResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
          <h1 className="mb-4 text-2xl font-bold">Checkout Error</h1>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {orderResult.error}
          </div>
        </div>
      </div>
    );
  }

  // Create payment with Midtrans
  const formData = new FormData();
  formData.append("orderId", orderResult.orderId);
  formData.append("grossAmount", orderResult.total.toString());

  const paymentResult = await createPayment({}, formData);

  if ("error" in paymentResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
          <h1 className="mb-4 text-2xl font-bold">Payment Error</h1>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {paymentResult.error}
          </div>
        </div>
      </div>
    );
  }

  // Show payment page with Midtrans Snap
  const snapToken = paymentResult.snapToken;
  const clientKey = getMidtransClientKey();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-4 text-2xl font-bold">Complete Payment</h1>
        <p className="mb-6 text-gray-600">
          Complete your payment to finish the order.
        </p>
        <div className="rounded-lg border p-4">
          <p className="mb-2 text-sm text-gray-600">Total Amount</p>
          <p className="text-3xl font-bold">
            ${orderResult.total.toFixed(2)}
          </p>
        </div>
        {snapToken && (
          <div className="mt-6">
            <button
              id="pay-button"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
            >
              Pay Now
            </button>
            <script
              src={`https://app.sandbox.midtrans.com/snap/snap.js`}
              data-client-key={clientKey}
              data-transaction-id={snapToken}
            ></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  document.getElementById('pay-button').onclick = function() {
                    window.snap.pay('${snapToken}', {
                      onSuccess: function(result) {
                        window.location.href = '/checkout/success?orderId=${orderResult.orderId}';
                      },
                      onPending: function(result) {
                        window.location.href = '/checkout/success?orderId=${orderResult.orderId}';
                      },
                      onError: function(result) {
                        window.location.href = '/checkout?error=payment_failed';
                      }
                    });
                  };
                `,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
