"use client";

import { useEffect, useState } from "react";

import CompanyDocuments, {
  type CompanyDocument,
} from "@/components/company/CompanyDocuments";
import CompanyLogoUpload from "@/components/company/CompanyLogoUpload";
import { Button } from "@/components/ui/button";
import { resolveCompanySlugForSave } from "@/lib/company";
import { COMPANY_INDUSTRIES } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";

const BUSINESS_TYPES = [
  "Exporter",
  "Importer",
  "Manufacturer",
  "Manufacturer & Exporter",
  "Trading Company",
  "Wholesaler / Distributor",
  "Sourcing Agent",
  "Buying Office",
  "OEM / ODM Supplier",
  "Private Label Supplier",
  "Commodity Trader",
  "Freight Forwarder",
  "Customs Broker",
];

const EMPLOYEE_RANGES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Germany",
  "Japan",
  "UAE",
  "China",
  "Singapore",
  "Australia",
  "Canada",
];

type CompanyProfile = {
  company_logo: string | null;
  company_name: string;
  about_company: string;
  industry: string;
  business_type: string;
  year_established: string;
  number_of_employees: string;
  address: string;
  country: string;
  city: string;
  website: string;
  linkedin: string;
  certifications: string;
  export_markets: string;
  import_markets: string;
  company_documents: CompanyDocument[];
};

const emptyProfile: CompanyProfile = {
  company_logo: null,
  company_name: "",
  about_company: "",
  industry: "",
  business_type: "",
  year_established: "",
  number_of_employees: "",
  address: "",
  country: "India",
  city: "",
  website: "",
  linkedin: "",
  certifications: "",
  export_markets: "",
  import_markets: "",
  company_documents: [],
};

function parseArrayField(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return "";
}

function parseDocuments(value: unknown): CompanyDocument[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is CompanyDocument =>
      typeof item === "object" &&
      item !== null &&
      "name" in item &&
      "url" in item
  );
}

function toArrayField(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function CompanyProfileForm() {
  const [userId, setUserId] = useState<string | null>(null);
  const [companySlug, setCompanySlug] = useState("");
  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        setLoading(false);
        return;
      }

      if (data) {
        setCompanySlug(data.company_slug ?? "");
        setProfile({
          company_logo: data.company_logo ?? null,
          company_name: data.company_name ?? "",
          about_company: data.about_company ?? "",
          industry: data.industry ?? "",
          business_type: data.business_type ?? "",
          year_established: data.year_established
            ? String(data.year_established)
            : "",
          number_of_employees: data.number_of_employees ?? "",
          address: data.address ?? "",
          country: data.country ?? "India",
          city: data.city ?? "",
          website: data.website ?? "",
          linkedin: data.linkedin ?? "",
          certifications: parseArrayField(data.certifications),
          export_markets: parseArrayField(data.export_markets),
          import_markets: parseArrayField(data.import_markets),
          company_documents: parseDocuments(data.company_documents),
        });
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  function updateField<K extends keyof CompanyProfile>(
    key: K,
    value: CompanyProfile[K]
  ) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setMessage(null);

    try {
      const slug = await resolveCompanySlugForSave({
        companyName: profile.company_name,
        existingSlug: companySlug,
        userId,
      });

      const { error } = await supabase
        .from("profiles")
        .update({
          company_logo: profile.company_logo,
          company_name: profile.company_name,
          company_slug: slug,
          about_company: profile.about_company,
        industry: profile.industry,
        business_type: profile.business_type,
        year_established: profile.year_established
          ? Number(profile.year_established)
          : null,
        number_of_employees: profile.number_of_employees,
        address: profile.address,
        country: profile.country,
        city: profile.city,
        website: profile.website,
        linkedin: profile.linkedin,
        certifications: toArrayField(profile.certifications),
        export_markets: toArrayField(profile.export_markets),
        import_markets: toArrayField(profile.import_markets),
        company_documents: profile.company_documents,
      })
      .eq("id", userId);

      setSaving(false);

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      if (slug) {
        setCompanySlug(slug);
      }

      setMessage({ type: "success", text: "Company profile saved successfully." });
    } catch (err) {
      setSaving(false);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save company profile.",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading company profile...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Please sign in to manage your company profile.</p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border bg-background p-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "mb-2 block text-sm font-medium text-foreground";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {userId && (
        <CompanyLogoUpload
          logoUrl={profile.company_logo}
          userId={userId}
          onLogoChange={(url) => updateField("company_logo", url)}
        />
      )}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Company Name</label>
            <input
              type="text"
              className={inputClass}
              placeholder="ABC Industries Pvt. Ltd."
              value={profile.company_name}
              onChange={(e) => updateField("company_name", e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>About Company</label>
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              placeholder="Describe your company, products, and trade capabilities..."
              value={profile.about_company}
              onChange={(e) => updateField("about_company", e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <label className={labelClass}>Industry</label>
            <select
              className={inputClass}
              value={profile.industry}
              onChange={(e) => updateField("industry", e.target.value)}
            >
              <option value="">Select industry</option>
              {COMPANY_INDUSTRIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Business Type</label>
            <select
              className={inputClass}
              value={profile.business_type}
              onChange={(e) => updateField("business_type", e.target.value)}
            >
              <option value="">Select business type</option>
              {BUSINESS_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Year Established</label>
            <input
              type="number"
              className={inputClass}
              placeholder="2010"
              min={1800}
              max={new Date().getFullYear()}
              value={profile.year_established}
              onChange={(e) => updateField("year_established", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Number of Employees</label>
            <select
              className={inputClass}
              value={profile.number_of_employees}
              onChange={(e) =>
                updateField("number_of_employees", e.target.value)
              }
            >
              <option value="">Select range</option>
              {EMPLOYEE_RANGES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Location & Contact</h3>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>
            <textarea
              className={`${inputClass} min-h-20 resize-y`}
              placeholder="Street address, building, suite..."
              value={profile.address}
              onChange={(e) => updateField("address", e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <label className={labelClass}>Country</label>
            <select
              className={inputClass}
              value={profile.country}
              onChange={(e) => updateField("country", e.target.value)}
            >
              {COUNTRIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>City</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Mumbai"
              value={profile.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Website</label>
            <input
              type="url"
              className={inputClass}
              placeholder="https://company.com"
              value={profile.website}
              onChange={(e) => updateField("website", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>LinkedIn</label>
            <input
              type="url"
              className={inputClass}
              placeholder="https://linkedin.com/company/your-company"
              value={profile.linkedin}
              onChange={(e) => updateField("linkedin", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Trade Information</h3>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Certifications</label>
            <input
              type="text"
              className={inputClass}
              placeholder="ISO 9001, CE, FDA (comma-separated)"
              value={profile.certifications}
              onChange={(e) => updateField("certifications", e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Separate multiple certifications with commas.
            </p>
          </div>

          <div>
            <label className={labelClass}>Export Markets</label>
            <input
              type="text"
              className={inputClass}
              placeholder="USA, Germany, UAE (comma-separated)"
              value={profile.export_markets}
              onChange={(e) => updateField("export_markets", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Import Markets</label>
            <input
              type="text"
              className={inputClass}
              placeholder="China, Vietnam, Japan (comma-separated)"
              value={profile.import_markets}
              onChange={(e) => updateField("import_markets", e.target.value)}
            />
          </div>
        </div>
      </div>

      <CompanyDocuments
        documents={profile.company_documents}
        userId={userId}
        onDocumentsChange={(docs) => updateField("company_documents", docs)}
      />

      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5 flex-1">
            {message ? (
              <p
                className={
                  message.type === "success"
                    ? "text-sm font-medium text-green-600"
                    : "text-sm font-medium text-destructive"
                }
              >
                {message.text}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Review your details before saving changes to your company profile.
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={saving}
            size="lg"
            className="w-full shrink-0 sm:w-auto sm:min-w-40"
          >
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </form>
  );
}
