import CompanyProfileForm from "@/components/company/CompanyProfileForm";

export default function CompanyProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Company Profile</h2>
        <p className="mt-1 text-muted-foreground">
          Manage your company details, trade information, and supporting documents.
        </p>
      </div>

      <CompanyProfileForm />
    </div>
  );
}
