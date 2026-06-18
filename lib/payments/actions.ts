"use server";

import { revalidatePath } from "next/cache";

import {
  createPaymentSchema,
  mapZodErrors,
  updatePaymentStatusSchema,
} from "@/lib/payments/schemas";
import type { PaymentActionState } from "@/lib/payments/types";
import { requireAuthenticated, requireAdmin } from "@/lib/payments/queries";
import {
  createMidtransTransaction,
  mapMidtransStatusToPaymentStatus,
  type MidtransCustomerDetails,
  type MidtransItemDetails,
  type MidtransTransactionRequest,
  type MidtransNotification,
  verifyMidtransSignature,
} from "@/lib/payments/midtrans";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/orders/queries";
import { generateLicenseForOrder } from "@/lib/licenses/actions";
import { getReferralFromCookie, clearReferralCookie } from "@/lib/affiliates/tracking";
import { getAffiliateByCode } from "@/lib/affiliates/queries";
import { createReferral } from "@/lib/affiliates/actions";
import { sendPurchaseSuccessEmail } from "@/lib/emails/actions";

const PAYMENTS_PATH = "/payments";
const ADMIN_PAYMENTS_PATH = "/admin/payments";

export async function createPayment(
  _prevState: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState & { snapToken?: string; redirectUrl?: string }> {
  const auth = await requireAuthenticated();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const orderId = formData.get("orderId") as string;
  const grossAmount = formData.get("grossAmount") as string;

  const parsed = createPaymentSchema.safeParse({
    orderId,
    grossAmount,
  });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  const supabase = await createClient();

  // Verify order exists and belongs to user
  const order = await getOrderById(parsed.data.orderId);

  if (!order) {
    return { error: "Order not found." };
  }

  if (order.user_id !== auth.user.id) {
    return { error: "You can only create payments for your own orders." };
  }

  // Check if payment already exists
  const existingPayment = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", parsed.data.orderId)
    .maybeSingle();

  if (existingPayment.data) {
    return { error: "Payment already exists for this order." };
  }

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      order_id: parsed.data.orderId,
      gross_amount: parsed.data.grossAmount,
      status: "pending",
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    return { error: paymentError?.message ?? "Failed to create payment." };
  }

  // Prepare Midtrans transaction
  const customerDetails: MidtransCustomerDetails = {
    first_name: auth.user.profile.full_name || "Customer",
    email: auth.user.email,
  };

  const itemDetails: MidtransItemDetails[] = order.order_items.map((item) => ({
    id: item.product_id,
    name: item.products.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const transactionRequest: MidtransTransactionRequest = {
    transaction_details: {
      order_id: payment.id,
      gross_amount: parsed.data.grossAmount,
    },
    customer_details: customerDetails,
    item_details: itemDetails,
  };

  try {
    const midtransResponse = await createMidtransTransaction(transactionRequest);

    // Update payment with Midtrans order ID
    await supabase
      .from("payments")
      .update({ midtrans_order_id: midtransResponse.token })
      .eq("id", payment.id);

    revalidatePath(PAYMENTS_PATH);
    revalidatePath(ADMIN_PAYMENTS_PATH);

    return {
      success: "Payment created successfully.",
      snapToken: midtransResponse.token,
      redirectUrl: midtransResponse.redirect_url,
    };
  } catch (error) {
    // Rollback payment on Midtrans error
    await supabase.from("payments").delete().eq("id", payment.id);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to create Midtrans transaction.",
    };
  }
}

export async function processWebhook(
  notification: MidtransNotification
): Promise<{ success: boolean; error?: string }> {
  // Verify signature
  if (!verifyMidtransSignature(notification)) {
    return { success: false, error: "Invalid signature" };
  }

  const supabase = await createClient();

  // Find payment by midtrans_order_id
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*, orders!inner(user_id)")
    .eq("midtrans_order_id", notification.order_id)
    .maybeSingle();

  if (paymentError || !payment) {
    return { success: false, error: "Payment not found" };
  }

  // Map Midtrans status to payment status
  const newStatus = mapMidtransStatusToPaymentStatus(
    notification.transaction_status,
    notification.fraud_status
  );

  // Update payment status
  const updateData: any = {
    status: newStatus,
  };

  if (newStatus === "paid") {
    updateData.paid_at = new Date().toISOString();
    updateData.payment_method = notification.payment_type;
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update(updateData)
    .eq("id", payment.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Update order status based on payment status
  if (newStatus === "paid") {
    await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", payment.order_id);

    // Generate licenses for each product in the order
    const order = await getOrderById(payment.order_id);
    if (order) {
      // Send purchase success email
      await sendPurchaseSuccessEmail(
        order.user_id,
        (payment as any).orders?.profiles?.email || "",
        (payment as any).orders?.profiles?.full_name || "Customer",
        payment.order_id,
        order.total
      );

      for (const item of order.order_items) {
        // Check if license already exists for this product and order
        const { data: existingLicense } = await supabase
          .from("licenses")
          .select("id")
          .eq("order_id", payment.order_id)
          .eq("product_id", item.product_id)
          .maybeSingle();

        if (!existingLicense) {
          await generateLicenseForOrder(
            payment.order_id,
            order.user_id,
            item.product_id
          );
        }
      }

      // Check for affiliate referral and create commission
      const referralCode = await getReferralFromCookie();
      if (referralCode) {
        const affiliate = await getAffiliateByCode(referralCode);
        
        if (affiliate && affiliate.status === "approved") {
          // Don't create commission if the buyer is the affiliate themselves
          if (affiliate.user_id !== order.user_id) {
            const commissionAmount = order.total * (affiliate.commission_rate / 100);
            await createReferral(
              affiliate.id,
              payment.order_id,
              commissionAmount
            );
          }
        }
        
        // Clear referral cookie after processing
        await clearReferralCookie();
      }
    }
  } else if (newStatus === "failed" || newStatus === "expired") {
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", payment.order_id);
  }

  revalidatePath(PAYMENTS_PATH);
  revalidatePath(ADMIN_PAYMENTS_PATH);
  revalidatePath(`/orders/${payment.order_id}`);
  revalidatePath("/licenses");
  revalidatePath("/admin/licenses");
  revalidatePath("/affiliate");
  revalidatePath("/admin/affiliates");
  revalidatePath("/admin/referrals");

  return { success: true };
}

export async function updatePaymentStatus(
  _prevState: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const auth = await requireAdmin();

  if ("error" in auth) {
    return { error: auth.error };
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!id) {
    return { error: "Payment ID is required." };
  }

  const parsed = updatePaymentStatusSchema.safeParse({ status });

  if (!parsed.success) {
    return { fieldErrors: mapZodErrors(parsed.error) };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("payments")
    .update({
      status: parsed.data.status,
      paid_at: parsed.data.status === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(ADMIN_PAYMENTS_PATH);
  revalidatePath(`${ADMIN_PAYMENTS_PATH}/${id}`);
  return { success: "Payment status updated." };
}
