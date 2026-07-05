import Link from "next/link";
import { Eye, Package, Pencil, Trash2 } from "lucide-react";

import ProductStatusBadge from "@/components/products/ProductStatusBadge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { parseProductImages } from "@/types/product";

type ProductCardCompany = {
  company_name: string;
  company_slug: string;
};

type ProductCardProps = {
  product: Product;
  variant?: "manage" | "public";
  company?: ProductCardCompany | null;
  showStatus?: boolean;
  onPreview?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
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

export default function ProductCard({
  product,
  variant = "manage",
  company,
  showStatus = false,
  onPreview,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const imageUrl = getPrimaryImage(product);
  const isPublic = variant === "public";
  const productHref = isPublic && product.slug ? `/product/${product.slug}` : null;

  const imageBlock = (
    <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-lg border bg-muted">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={product.product_name}
          className="size-full object-cover transition-transform group-hover:scale-[1.02]"
        />
      ) : (
        <Package className="size-10 text-muted-foreground" strokeWidth={1.5} />
      )}
    </div>
  );

  const metaBlock = (
    <>
      <p className="mt-1 truncate text-sm text-muted-foreground">
        {product.product_category || "Uncategorized"}
      </p>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{product.country_of_origin || "—"}</span>
        <span>MOQ: {product.moq || "—"}</span>
      </div>
    </>
  );

  if (isPublic) {
    return (
      <article className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-colors hover:border-blue-200">
        <div className="flex flex-1 flex-col p-4">
          {productHref ? (
            <Link href={productHref} className="group block">
              {imageBlock}
            </Link>
          ) : (
            <div className="group block">{imageBlock}</div>
          )}

          <div className="mt-4 flex items-start justify-between gap-2">
            {productHref ? (
              <Link
                href={productHref}
                className="line-clamp-2 font-semibold text-foreground hover:text-blue-600"
              >
                {product.product_name || "Untitled Product"}
              </Link>
            ) : (
              <h3 className="line-clamp-2 font-semibold text-foreground">
                {product.product_name || "Untitled Product"}
              </h3>
            )}
            {showStatus && <ProductStatusBadge status={product.status} />}
          </div>

          {company?.company_name && company.company_slug ? (
            <Link
              href={`/company/${company.company_slug}`}
              className="mt-1 truncate text-sm text-blue-600 hover:underline"
            >
              {company.company_name}
            </Link>
          ) : null}

          {metaBlock}
        </div>
      </article>
    );
  }

  const cardBody = (
    <>
      {imageBlock}

      <div className="mt-4 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 font-semibold text-foreground">
          {product.product_name || "Untitled Product"}
        </h3>
        <ProductStatusBadge status={product.status} />
      </div>

      {metaBlock}

      <p className="mt-2 text-xs text-muted-foreground">
        Updated {formatDate(product.updated_at)}
      </p>
    </>
  );

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-colors hover:border-blue-200">
      <Link
        href={`/dashboard/products/${product.id}`}
        className="group block flex-1 p-4"
      >
        {cardBody}
      </Link>

      {!isPublic && (
        <div className="grid grid-cols-3 gap-2 border-t bg-muted/20 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPreview?.(product)}
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(product)}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete?.(product)}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </div>
      )}
    </article>
  );
}
