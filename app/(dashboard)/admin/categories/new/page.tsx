import { CategoryForm } from "@/components/admin/category-form";

export const metadata = {
  title: "New Category | Admin | Lumintu Suite",
};

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          New category
        </h1>
        <p className="text-muted-foreground">
          Create a category for your product catalog.
        </p>
      </div>
      <CategoryForm />
    </div>
  );
}
