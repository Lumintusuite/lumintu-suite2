import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { getProductById, listAllCategories } from "@/lib/catalog/queries";

export const metadata = {
  title: "Edit Product | Admin | Lumintu Suite",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProductById(id),
    listAllCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Edit product
        </h1>
        <p className="text-muted-foreground">Update {product.name}.</p>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
