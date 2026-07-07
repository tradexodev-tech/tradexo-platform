import Link from "next/link";
import { Bell } from "lucide-react";

export default function DashboardSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard Settings</h2>
        <p className="mt-1 text-muted-foreground">
          Manage your Tradexo workspace preferences.
        </p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Link
          href="/dashboard/settings/notifications"
          className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <Bell className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">
              Notification Preferences
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Control email and in-app notification settings.
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
