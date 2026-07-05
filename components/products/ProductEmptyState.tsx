import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type ProductEmptyStateProps = {
  onAddProduct: () => void;
};

export default function ProductEmptyState({
  onAddProduct,
}: ProductEmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="text-5xl leading-none" role="img" aria-label="Package">
        📦
      </span>
      <h3 className="mt-6 text-lg font-semibold text-foreground">
        No products yet
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Start building your export catalog by
        <br />
        adding your first product.
      </p>
      <Button onClick={onAddProduct} className="mt-6">
        <Plus className="size-4" />
        Add Product
      </Button>
      <p className="mt-4 text-sm text-muted-foreground">
        Import Products{" "}
        <span className="text-xs">(Coming Soon)</span>
      </p>
    </div>
  );
}
