"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

interface BuyNowButtonProps {
  product: Product;
}

export function BuyNowButton({ product }: BuyNowButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyNow = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              productId: product.id,
              price: product.price,
              quantity: 1,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initiate checkout");
      }

      const data = await response.json();
      router.push(data.redirectUrl || "/checkout");
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Failed to initiate checkout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBuyNow}
      disabled={isLoading || product.status !== "published"}
      size="lg"
      className="w-full"
    >
      {isLoading ? "Processing..." : "Buy Now"}
    </Button>
  );
}
