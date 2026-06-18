import { NextRequest, NextResponse } from "next/server";

import { processWebhook } from "@/lib/payments/actions";
import { webhookSchema } from "@/lib/payments/schemas";
import type { MidtransNotification } from "@/lib/payments/midtrans";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate webhook data
    const parsed = webhookSchema.safeParse(body);

    if (!parsed.success) {
      console.error("Invalid webhook data:", parsed.error);
      return NextResponse.json(
        { error: "Invalid webhook data" },
        { status: 400 }
      );
    }

    const notification: MidtransNotification = parsed.data;

    // Process webhook
    const result = await processWebhook(notification);

    if (!result.success) {
      console.error("Webhook processing failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Webhook processing failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
