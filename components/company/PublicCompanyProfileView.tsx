import type { ReactNode } from "react";
import { Building2, MapPin, Package, Star } from "lucide-react";

import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import type { PublicCompanyProfile } from "@/types/company";
import type { Product } from "@/types/product";

type PublicCompanyProfileViewProps = {
  company: PublicCompanyProfile;
  products: Product[];
};

function parseBusinessTypes(value: string): string[] {
  if (!value.trim()) return [];

  return value
    .split(/[,&/|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b py-4 last:border-b-0">
      <dt className="text-sm font-medium text-foreground">{label}</dt>
      <dd className="mt-2">{children}</dd>
    </div>
  );
}

function TagList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border bg-muted/40 px-3 py-1 text-sm text-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SectionDivider() {
  return <hr className="border-border" />;
}

export default function PublicCompanyProfileView({
  company,
  products,
}: PublicCompanyProfileViewProps) {
  const location = [company.city, company.country].filter(Boolean).join(", ");
  const businessTypes = parseBusinessTypes(company.business_type);

  return (
    <main className="flex-1 bg-background">
      <div className="relative h-44 bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 sm:h-52 md:h-56">
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2
            className="size-16 text-slate-300 sm:size-20"
            strokeWidth={1.25}
            aria-hidden
          />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <header className="-mt-16 pb-8 text-center">
          <div className="mx-auto flex size-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-card shadow-md sm:size-32">
            {company.company_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.company_logo}
                alt={`${company.company_name} logo`}
                className="size-full object-cover"
              />
            ) : (
              <Building2 className="size-12 text-muted-foreground" strokeWidth={1.5} />
            )}
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {company.company_name || "Company Profile"}
          </h1>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            <div className="flex items-center gap-0.5 text-amber-500" aria-hidden>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-4 fill-current" />
              ))}
            </div>
            <span className="text-sm font-medium text-foreground">Verified Supplier</span>
          </div>

          {location && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {location}
            </p>
          )}

          {businessTypes.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
              {businessTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-foreground"
                >
                  {type}
                </span>
              ))}
            </div>
          )}

          <Button type="button" size="lg" className="mt-6 min-w-44">
            Contact Supplier
          </Button>
        </header>

        <SectionDivider />

        <section className="py-8">
          <h2 className="text-lg font-semibold text-foreground">About Company</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {company.about_company?.trim() ||
              "This company has not added a description yet."}
          </p>
        </section>

        <SectionDivider />

        <section className="py-8">
          <h2 className="text-lg font-semibold text-foreground">Business Information</h2>
          <dl className="mt-4">
            <InfoRow label="Year Established">
              <p className="text-sm text-muted-foreground">
                {company.year_established ?? "—"}
              </p>
            </InfoRow>

            <InfoRow label="Employees">
              <p className="text-sm text-muted-foreground">
                {company.number_of_employees || "—"}
              </p>
            </InfoRow>

            <InfoRow label="Export Markets">
              <TagList
                items={company.export_markets}
                emptyLabel="No export markets listed."
              />
            </InfoRow>

            <InfoRow label="Import Markets">
              <TagList
                items={company.import_markets}
                emptyLabel="No import markets listed."
              />
            </InfoRow>

            <InfoRow label="Certifications">
              <TagList
                items={company.certifications}
                emptyLabel="No certifications listed."
              />
            </InfoRow>
          </dl>
        </section>

        <SectionDivider />

        <section className="py-8 pb-12">
          <h2 className="text-lg font-semibold text-foreground">Products</h2>

          {products.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-xl border bg-card px-6 py-16 text-center">
              <Package
                className="size-12 text-muted-foreground"
                strokeWidth={1.25}
                aria-hidden
              />
              <h3 className="mt-4 text-base font-semibold text-foreground">
                No published products
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                This company has not published any products to their public catalog yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} variant="public" />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
