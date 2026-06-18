import { ProductForm } from "@/components/admin/product-form";
import { listAllCategories } from "@/lib/catalog/queries";

export const metadata = {
  title: "New Product | Admin | Lumintu Suite",
};

export default async function NewProductPage() {
  const categories = await listAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          New product
        </h1>
        <p className="text-muted-foreground">
          Add a digital product to your catalog.
        </p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
