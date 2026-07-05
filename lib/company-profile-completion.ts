import type { PublicCompanyProfile } from "@/types/company";

export const REQUIRED_COMPANY_PROFILE_FIELDS = [
  "company_name",
  "about_company",
  "industry",
  "business_type",
  "year_established",
  "number_of_employees",
  "address",
  "country",
  "city",
  "company_logo",
] as const satisfies readonly (keyof PublicCompanyProfile)[];

function isCompanyProfileFieldFilled(
  profile: PublicCompanyProfile,
  field: (typeof REQUIRED_COMPANY_PROFILE_FIELDS)[number]
): boolean {
  const value = profile[field];

  if (value == null) {
    return false;
  }

  if (typeof value === "number") {
    return !Number.isNaN(value);
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return Boolean(value);
}

export function calculateCompanyProfileCompletion(
  profile: PublicCompanyProfile
): number {
  const filledCount = REQUIRED_COMPANY_PROFILE_FIELDS.filter((field) =>
    isCompanyProfileFieldFilled(profile, field)
  ).length;

  return Math.round(
    (filledCount / REQUIRED_COMPANY_PROFILE_FIELDS.length) * 100
  );
}
