import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/category-form";
import { getCategoryById } from "@/lib/catalog/queries";

export const metadata = {
  title: "Edit Category | Admin | Lumintu Suite",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Edit category
        </h1>
        <p className="text-muted-foreground">Update {category.name}.</p>
      </div>
      <CategoryForm category={category} />
    </div>
  );
}
