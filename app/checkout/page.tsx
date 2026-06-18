import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-user";
import { createOrder } from "@/lib/orders/actions";

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

  // Process the order immediately
  const formData = new FormData();
  formData.append("items", itemsJson);

  const result = await createOrder({}, formData);

  if ("error" in result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
          <h1 className="mb-4 text-2xl font-bold">Checkout Error</h1>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {result.error}
          </div>
        </div>
      </div>
    );
  }

  // The action will redirect to success page
  return null;
}
