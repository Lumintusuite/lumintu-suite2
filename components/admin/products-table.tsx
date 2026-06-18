"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Pencil, Upload } from "lucide-react";

import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProduct, publishProduct } from "@/lib/catalog/actions";
import { formatPrice, getStoragePublicUrl } from "@/lib/catalog/utils";
import type { ProductWithCategory } from "@/lib/supabase/types";

export function ProductsTable({ products }: { products: ProductWithCategory[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function refreshAfterAction(
    action: () => Promise<{ error?: string; success?: string }>
  ) {
    return action().then((result) => {
      if (!result.error) {
        startTransition(() => router.refresh());
      }
      return result;
    });
  }

  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No products found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const thumbnailUrl = getStoragePublicUrl(
            "products",
            product.thumbnail_path
          );

          return (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="size-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                      —
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.slug}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{product.categories?.name ?? "—"}</TableCell>
              <TableCell>{formatPrice(Number(product.price))}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    product.status === "published" ? "default" : "secondary"
                  }
                >
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {product.status === "draft" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        refreshAfterAction(() => publishProduct(product.id))
                      }
                    >
                      <Upload className="size-4" />
                      Publish
                    </Button>
                  ) : null}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteConfirmDialog
                    title="Delete product?"
                    description={`This will permanently delete "${product.name}" and its uploaded files.`}
                    onConfirm={() =>
                      refreshAfterAction(() => deleteProduct(product.id))
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
