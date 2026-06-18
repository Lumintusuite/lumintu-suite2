import crypto from "crypto";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

const MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

export interface MidtransTransactionDetails {
  order_id: string;
  gross_amount: number;
}

export interface MidtransCustomerDetails {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
}

export interface MidtransItemDetails {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface MidtransTransactionRequest {
  transaction_details: MidtransTransactionDetails;
  customer_details: MidtransCustomerDetails;
  item_details: MidtransItemDetails[];
}

export interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

export interface MidtransNotification {
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status: string;
  fraud_status?: string;
  signature_key: string;
}

export function createMidtransSignatureKey(
  orderId: string,
  statusCode: string,
  grossAmount: string
): string {
  const rawSignature = `${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`;
  return crypto.createHash("sha512").update(rawSignature).digest("hex");
}

export function verifyMidtransSignature(
  notification: MidtransNotification
): boolean {
  const signature = createMidtransSignatureKey(
    notification.order_id,
    notification.transaction_status,
    notification.gross_amount
  );
  return signature === notification.signature_key;
}

export async function createMidtransTransaction(
  request: MidtransTransactionRequest
): Promise<MidtransSnapResponse> {
  const response = await fetch(`${MIDTRANS_API_URL}/v2/charge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString(
        "base64"
      )}`,
    },
    body: JSON.stringify({
      ...request,
      enabled_payments: [
        "credit_card",
        "gopay",
        "shopeepay",
        "qris",
        "bca_va",
        "bni_va",
        "bri_va",
        "permata_va",
        "cimb_va",
        "mandiri_bill",
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Midtrans API error: ${error}`);
  }

  const data = await response.json();
  return data;
}

export function mapMidtransStatusToPaymentStatus(
  transactionStatus: string,
  fraudStatus?: string
): "pending" | "paid" | "failed" | "expired" {
  if (transactionStatus === "settlement" || transactionStatus === "capture") {
    if (fraudStatus === "challenge") {
      return "pending";
    }
    return "paid";
  }

  if (transactionStatus === "pending") {
    return "pending";
  }

  if (transactionStatus === "deny" || transactionStatus === "cancel") {
    return "failed";
  }

  if (transactionStatus === "expire") {
    return "expired";
  }

  return "pending";
}

export function getMidtransClientKey(): string {
  return process.env.MIDTRANS_CLIENT_KEY || "";
}
