import Link from "next/link";
import { Building2, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PublicCompanyProfile } from "@/types/company";

type PublicCompanySummaryProps = {
  company: PublicCompanyProfile;
};

export default function PublicCompanySummary({ company }: PublicCompanySummaryProps) {
  const location = [company.city, company.country].filter(Boolean).join(", ");
  const profileHref = company.company_slug
    ? `/company/${company.company_slug}`
    : null;

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Company Information</h2>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
          {company.company_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.company_logo}
              alt={`${company.company_name} logo`}
              className="size-full object-cover"
            />
          ) : (
            <Building2 className="size-8 text-muted-foreground" strokeWidth={1.5} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {profileHref ? (
            <Link
              href={profileHref}
              className="text-lg font-semibold text-foreground hover:text-blue-600"
            >
              {company.company_name || "Company Profile"}
            </Link>
          ) : (
            <p className="text-lg font-semibold text-foreground">
              {company.company_name || "Company Profile"}
            </p>
          )}

          {location && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {location}
            </p>
          )}

          {company.industry && (
            <p className="mt-1 text-sm text-muted-foreground">{company.industry}</p>
          )}

          {company.business_type && (
            <p className="mt-1 text-sm text-muted-foreground">{company.business_type}</p>
          )}

          {company.about_company?.trim() && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {company.about_company}
            </p>
          )}

          {profileHref && (
            <Link
              href={profileHref}
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              View company profile
            </Link>
          )}
        </div>
      </div>

      <Button type="button" size="lg" className="mt-6 w-full sm:w-auto">
        Contact Supplier
      </Button>
    </section>
  );
}
