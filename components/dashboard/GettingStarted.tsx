import { CheckCircle2, Circle, Lock } from "lucide-react";

type GettingStartedProps = {
  hasProfile: boolean;
  hasRole: boolean;
};

const items = [
  { label: "Complete your profile", key: "profile" as const },
  { label: "Select your role", key: "role" as const },
  { label: "Add company details", key: "company" as const, locked: true },
  { label: "Add products", key: "products" as const, locked: true },
];

export default function GettingStarted({
  hasProfile,
  hasRole,
}: GettingStartedProps) {
  function isComplete(key: (typeof items)[number]["key"]) {
    if (key === "profile") return hasProfile;
    if (key === "role") return hasRole;
    return false;
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Getting Started</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => {
          const complete = isComplete(item.key);
          const locked = item.locked;

          return (
            <li key={item.key} className="flex items-center gap-3">
              {locked ? (
                <Lock className="size-5 shrink-0 text-muted-foreground" />
              ) : complete ? (
                <CheckCircle2 className="size-5 shrink-0 text-green-600" />
              ) : (
                <Circle className="size-5 shrink-0 text-muted-foreground" />
              )}
              <span
                className={
                  locked
                    ? "text-muted-foreground"
                    : complete
                      ? "font-medium text-foreground"
                      : "text-foreground"
                }
              >
                {item.label}
              </span>
              {locked && (
                <span className="ml-auto text-xs text-muted-foreground">
                  Coming Soon
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
