"use client";

import { Archive, MoreHorizontal, Package, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import ProductStatusBadge from "@/components/products/ProductStatusBadge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { parseProductImages } from "@/types/product";

type ProductTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
  onDelete: (product: Product) => void;
};

function getPrimaryImage(product: Product) {
  const images = parseProductImages(product.product_images);
  return images[0]?.url ?? null;
}

function formatDate(dateString: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ActionMenu({
  product,
  onEdit,
  onArchive,
  onDelete,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Product actions"
      >
        <MoreHorizontal className="size-4" />
      </Button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                onEdit(product);
                setOpen(false);
              }}
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
            {product.status !== "archived" && (
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                onClick={() => {
                  onArchive(product);
                  setOpen(false);
                }}
              >
                <Archive className="size-3.5" />
                Archive
              </button>
            )}
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                onDelete(product);
                setOpen(false);
              }}
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductTable({
  products,
  onEdit,
  onArchive,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Image
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Product Name
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  MOQ
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Updated
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const imageUrl = getPrimaryImage(product);
                return (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt={product.product_name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Package className="size-4 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {product.product_name || "Untitled Product"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {product.product_category || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ProductStatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {product.moq || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(product.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu
                        product={product}
                        onEdit={onEdit}
                        onArchive={onArchive}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
  );
}
