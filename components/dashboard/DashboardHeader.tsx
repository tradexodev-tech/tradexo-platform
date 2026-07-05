import UserMenu from "./UserMenu";

type DashboardHeaderProps = {
  fullName: string;
  companyName: string;
  onLogout: () => void;
};

export default function DashboardHeader({
  fullName,
  companyName,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage your Tradexo workspace
        </p>
      </div>
      <UserMenu
        fullName={fullName}
        companyName={companyName}
        onLogout={onLogout}
      />
    </header>
  );
}
