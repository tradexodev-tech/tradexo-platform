import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  MapPin,
  Package,
} from "lucide-react";

import {
  formatMarketplaceLeadTime,
  formatMarketplaceMoq,
  formatMarketplaceProductPrice,
  getMarketplaceCompanyHref,
  getMarketplaceProductExcerpt,
  getMarketplaceProductHref,
  getMarketplaceProductImageUrl,
} from "@/lib/marketplace-product-card";
import type { MarketplaceProduct } from "@/lib/product-public";

type MarketplaceProductCardProps = {
  product: MarketplaceProduct;
  variant?: "default" | "featured";
};

export default function MarketplaceProductCard({
  product,
  variant = "default",
}: MarketplaceProductCardProps) {
  const imageUrl = getMarketplaceProductImageUrl(product);
  const productHref = getMarketplaceProductHref(product);
  const companyHref = getMarketplaceCompanyHref(product);
  const excerpt = getMarketplaceProductExcerpt(product);
  const price = formatMarketplaceProductPrice(product);
  const moq = formatMarketplaceMoq(product);
  const leadTime = formatMarketplaceLeadTime(product);
  const company = product.company;
  const isFeatured = variant === "featured";

  const imageContent = imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={product.product_name}
      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
    />
  ) : (
    <Package className="size-12 text-muted-foreground" strokeWidth={1.5} />
  );

  const imageBadges = (
    <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
      <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
        {product.product_category || "Uncategorized"}
      </span>
      {product.country_of_origin ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
          <MapPin className="size-3" aria-hidden="true" />
          {product.country_of_origin}
        </span>
      ) : null}
    </div>
  );

  const imageBlock = (
    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
      {imageBadges}
      <div className="flex size-full items-center justify-center">
        {imageContent}
      </div>
    </div>
  );

  const supplierBlock = company?.company_name ? (
    <div className="mt-4 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background">
          {company.company_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.company_logo}
              alt={`${company.company_name} logo`}
              className="size-full object-cover"
            />
          ) : (
            <Building2
              className="size-4 text-muted-foreground"
              strokeWidth={1.5}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {company.company_name}
            </p>
            {company.is_verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Verified Supplier
              </span>
            ) : null}
          </div>
          {company.industry ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {company.industry}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  ) : null;

  const contentBlock = (
    <div className="flex flex-1 flex-col p-4">
      <h3 className="line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-blue-600">
        {product.product_name || "Untitled Product"}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {excerpt}
      </p>

      {supplierBlock}

      <p className="mt-3 text-xs text-muted-foreground">{moq}</p>

      <p className="mt-3 text-lg font-semibold text-blue-700">{price}</p>

      <span className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors group-hover:bg-muted">
        View Product
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  );

  const cardClassName = isFeatured
    ? "group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    : "group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:border-blue-200 hover:shadow-md";

  if (isFeatured && productHref) {
    return (
      <Link href={productHref} className={cardClassName}>
        {imageBlock}
        {contentBlock}
      </Link>
    );
  }

  if (isFeatured) {
    return (
      <article className={cardClassName}>
        {imageBlock}
        {contentBlock}
      </article>
    );
  }

  return (
    <article className={cardClassName}>
      {productHref ? (
        <Link href={productHref} className="relative block aspect-[4/3] overflow-hidden bg-muted">
          {imageBadges}
          <div className="flex size-full items-center justify-center">
            {imageContent}
          </div>
        </Link>
      ) : (
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {imageBadges}
          <div className="flex size-full items-center justify-center">
            {imageContent}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        {productHref ? (
          <Link
            href={productHref}
            className="line-clamp-2 text-base font-semibold text-foreground transition-colors hover:text-blue-600"
          >
            {product.product_name || "Untitled Product"}
          </Link>
        ) : (
          <h3 className="line-clamp-2 text-base font-semibold text-foreground">
            {product.product_name || "Untitled Product"}
          </h3>
        )}

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {excerpt}
        </p>

        {company?.company_name ? (
          <div className="mt-4 rounded-lg border bg-muted/20 p-3">
            <div className="flex items-start gap-2">
              <Building2
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0">
                {companyHref ? (
                  <Link
                    href={companyHref}
                    className="truncate text-sm font-medium text-blue-600 hover:underline"
                  >
                    {company.company_name}
                  </Link>
                ) : (
                  <p className="truncate text-sm font-medium text-foreground">
                    {company.company_name}
                  </p>
                )}
                {company.industry ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {company.industry}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{moq}</span>
          <span>{leadTime}</span>
        </div>

        <p className="mt-3 text-lg font-semibold text-blue-700">{price}</p>

        {productHref ? (
          <Link
            href={productHref}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            View Product
            <ArrowRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
