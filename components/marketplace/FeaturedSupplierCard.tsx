import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  MapPin,
  Briefcase,
} from "lucide-react";

import {
  formatFeaturedSupplierProductCount,
  getFeaturedSupplierExcerpt,
  getFeaturedSupplierHref,
  type FeaturedSupplier,
} from "@/lib/featured-suppliers";

type FeaturedSupplierCardProps = {
  supplier: FeaturedSupplier;
};

export default function FeaturedSupplierCard({
  supplier,
}: FeaturedSupplierCardProps) {
  const href = getFeaturedSupplierHref(supplier);
  const excerpt = getFeaturedSupplierExcerpt(supplier);
  const productCount = formatFeaturedSupplierProductCount(
    supplier.published_product_count
  );

  if (!href) {
    return null;
  }

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted transition-transform duration-200 group-hover:scale-[1.03]">
          {supplier.company_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={supplier.company_logo}
              alt={`${supplier.company_name} logo`}
              className="size-full object-cover"
            />
          ) : (
            <Building2
              className="size-6 text-muted-foreground"
              strokeWidth={1.5}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="line-clamp-1 text-base font-semibold text-foreground transition-colors group-hover:text-blue-600">
              {supplier.company_name}
            </h3>
            {supplier.is_verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Verified
              </span>
            ) : null}
          </div>

          {supplier.industry ? (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {supplier.industry}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {supplier.country ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <MapPin className="size-3" aria-hidden="true" />
            {supplier.country}
          </span>
        ) : null}
        {supplier.supplier_type ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <Briefcase className="size-3" aria-hidden="true" />
            {supplier.supplier_type}
          </span>
        ) : null}
      </div>

      <p className="mt-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {excerpt}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
        <span className="text-sm font-medium text-foreground">
          {productCount}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-700">
          View Company
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
