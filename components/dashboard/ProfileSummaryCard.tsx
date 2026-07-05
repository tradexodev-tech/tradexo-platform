type ProfileSummaryCardProps = {
  fullName: string;
  companyName: string;
  role: string;
  country: string;
};

export default function ProfileSummaryCard({
  fullName,
  companyName,
  role,
  country,
}: ProfileSummaryCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Profile Summary</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Name</dt>
          <dd className="mt-1 font-medium text-foreground">{fullName}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Company</dt>
          <dd className="mt-1 font-medium text-foreground">{companyName}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Role</dt>
          <dd className="mt-1">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {role}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Country</dt>
          <dd className="mt-1 font-medium text-foreground">{country}</dd>
        </div>
      </dl>
    </div>
  );
}
