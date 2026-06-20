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
import { paymentRepository } from "@/lib/db/payment-repository";
import { orderRepository } from "@/lib/db/order-repository";
import { getOrderById } from "@/lib/orders/queries";
import { generateLicenseForOrder } from "@/lib/licenses/actions";
import { getReferralFromCookie, clearReferralCookie } from "@/lib/affiliates/tracking";
import { getAffiliateByCode } from "@/lib/affiliates/queries";
import { createReferral } from "@/lib/affiliates/actions";
import { sendPurchaseSuccessEmail } from "@/lib/emails/actions";
import { PaymentStatus, OrderStatus } from "@prisma/client";

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

  // Verify order exists and belongs to user
  const order = await getOrderById(parsed.data.orderId);

  if (!order) {
    return { error: "Order not found." };
  }

  if (order.userId !== auth.user.id) {
    return { error: "You can only create payments for your own orders." };
  }

  // Check if payment already exists
  const existingPayment = await paymentRepository.getPaymentByOrderId(parsed.data.orderId);

  if (existingPayment) {
    return { error: "Payment already exists for this order." };
  }

  // Create payment record
  let payment;
  try {
    payment = await paymentRepository.createPayment({
      orderId: parsed.data.orderId,
      grossAmount: parseFloat(parsed.data.grossAmount),
      status: PaymentStatus.pending,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to create payment." };
  }

  // Prepare Midtrans transaction
  const customerDetails: MidtransCustomerDetails = {
    first_name: auth.user.profile.full_name || "Customer",
    email: auth.user.email,
  };

  const itemDetails: MidtransItemDetails[] = order.items.map((item: any) => ({
    id: item.productId,
    name: item.product.name,
    price: Number(item.price),
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
    await paymentRepository.updatePayment(payment.id, {
      midtransOrderId: midtransResponse.token,
    });

    revalidatePath(PAYMENTS_PATH);
    revalidatePath(ADMIN_PAYMENTS_PATH);

    return {
      success: "Payment created successfully.",
      snapToken: midtransResponse.token,
      redirectUrl: midtransResponse.redirect_url,
    };
  } catch (error) {
    // Rollback payment on Midtrans error
    await paymentRepository.deletePayment(payment.id);
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

  // Find payment by midtrans_order_id
  const payment = await paymentRepository.getPaymentByMidtransOrderId(notification.order_id);

  if (!payment) {
    return { success: false, error: "Payment not found" };
  }

  // Map Midtrans status to payment status
  const newStatus = mapMidtransStatusToPaymentStatus(
    notification.transaction_status,
    notification.fraud_status
  );

  // Update payment status
  const updateData: any = {
    status: newStatus as PaymentStatus,
  };

  if (newStatus === "paid") {
    updateData.paidAt = new Date();
    updateData.paymentMethod = notification.payment_type;
  }

  try {
    await paymentRepository.updatePayment(payment.id, updateData);
  } catch (error: any) {
    return { success: false, error: error.message };
  }

  // Update order status based on payment status
  if (newStatus === "paid") {
    try {
      await orderRepository.updateOrder(payment.orderId, {
        status: OrderStatus.completed,
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }

    // Generate licenses for each product in the order
    const order = await getOrderById(payment.orderId);
    if (order) {
      // Send purchase success email
      await sendPurchaseSuccessEmail(
        order.userId,
        order.user.email || "",
        order.user.profile?.full_name || "Customer",
        payment.orderId,
        Number(order.total)
      );

      for (const item of order.items) {
        // Check if license already exists for this product and order
        const existingLicense = await paymentRepository.getPaymentByOrderId(payment.orderId);

        if (!existingLicense) {
          await generateLicenseForOrder(
            payment.orderId,
            order.userId,
            item.productId
          );
        }
      }

      // Check for affiliate referral and create commission
      const referralCode = await getReferralFromCookie();
      if (referralCode) {
        const affiliate = await getAffiliateByCode(referralCode);
        
        if (affiliate && affiliate.status === "approved") {
          // Don't create commission if the buyer is the affiliate themselves
          if (affiliate.user_id !== order.userId) {
            const commissionAmount = Number(order.total) * (affiliate.commission_rate / 100);
            await createReferral(
              affiliate.id,
              payment.orderId,
              commissionAmount
            );
          }
        }
        
        // Clear referral cookie after processing
        await clearReferralCookie();
      }
    }
  } else if (newStatus === "failed" || newStatus === "expired") {
    try {
      await orderRepository.updateOrder(payment.orderId, {
        status: newStatus as OrderStatus,
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  revalidatePath(PAYMENTS_PATH);
  revalidatePath(ADMIN_PAYMENTS_PATH);
  revalidatePath(`/orders/${payment.orderId}`);
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

  try {
    await paymentRepository.updatePayment(id, {
      status: parsed.data.status as PaymentStatus,
      paidAt: parsed.data.status === "paid" ? new Date() : undefined,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to update payment status." };
  }

  revalidatePath(ADMIN_PAYMENTS_PATH);
  revalidatePath(`${ADMIN_PAYMENTS_PATH}/${id}`);
  return { success: "Payment status updated." };
}
