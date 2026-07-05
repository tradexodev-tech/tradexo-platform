import { Button } from "@/components/ui/button";

type UserMenuProps = {
  fullName: string;
  companyName: string;
  onLogout: () => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UserMenu({
  fullName,
  companyName,
  onLogout,
}: UserMenuProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {getInitials(fullName || "U")}
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-foreground">{fullName}</p>
          <p className="text-xs text-muted-foreground">{companyName}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onLogout}>
        Logout
      </Button>
    </div>
  );
}
