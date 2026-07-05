"use client";

import { Button } from "@/components/ui/button";

type ProductDeleteDialogProps = {
  open: boolean;
  productName: string;
  deleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ProductDeleteDialog({
  open,
  productName,
  deleting = false,
  onCancel,
  onConfirm,
}: ProductDeleteDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={deleting ? undefined : onCancel}
        aria-hidden
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
        className="relative w-full max-w-md rounded-xl border bg-white p-6 shadow-xl"
      >
        <h2
          id="delete-product-title"
          className="text-lg font-semibold text-foreground"
        >
          Delete product?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">
            {productName || "this product"}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting ? "Deleting..." : "Delete Product"}
          </Button>
        </div>
      </div>
    </div>
  );
}
