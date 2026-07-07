import {
  EMAIL_NOTIFICATION_OPTIONS,
  INAPP_NOTIFICATION_OPTIONS,
  type NotificationPreferenceKey,
  type NotificationPreferences,
} from "@/types/notification-preferences";
import { cn } from "@/lib/utils";

type NotificationPreferencesProps = {
  preferences: NotificationPreferences | null;
  loading: boolean;
  savingKey: NotificationPreferenceKey | null;
  error: string | null;
  successMessage: string | null;
  onPreferenceChange: (key: NotificationPreferenceKey, value: boolean) => void;
};

function PreferenceSection({
  title,
  description,
  options,
  preferences,
  savingKey,
  onPreferenceChange,
}: {
  title: string;
  description: string;
  options: typeof EMAIL_NOTIFICATION_OPTIONS;
  preferences: NotificationPreferences;
  savingKey: NotificationPreferenceKey | null;
  onPreferenceChange: (key: NotificationPreferenceKey, value: boolean) => void;
}) {
  return (
    <section
      aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-heading`}
      className="rounded-xl border bg-card p-6 shadow-sm"
    >
      <div className="mb-5">
        <h3
          id={`${title.replace(/\s+/g, "-").toLowerCase()}-heading`}
          className="text-lg font-semibold text-foreground"
        >
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <ul className="space-y-4" role="list">
        {options.map((option) => {
          const inputId = `notification-preference-${option.key}`;
          const isSaving = savingKey === option.key;

          return (
            <li key={option.key}>
              <label
                htmlFor={inputId}
                className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={preferences[option.key]}
                  disabled={Boolean(savingKey)}
                  aria-busy={isSaving}
                  onChange={(event) => {
                    onPreferenceChange(option.key, event.target.checked);
                  }}
                  className="mt-0.5 size-4 rounded border-input text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                  {isSaving ? (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Saving...
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PreferencesSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true" aria-busy="true">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <div className="mb-5 space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((__, optionIndex) => (
              <div
                key={optionIndex}
                className="h-14 animate-pulse rounded-lg border bg-muted/40"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationPreferences({
  preferences,
  loading,
  savingKey,
  error,
  successMessage,
  onPreferenceChange,
}: NotificationPreferencesProps) {
  if (loading) {
    return <PreferencesSkeleton />;
  }

  if (!preferences) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      >
        {error ?? "Unable to load notification preferences."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {successMessage}
        </div>
      ) : null}

      <PreferenceSection
        title="Email Notifications"
        description="Choose which events send email notifications to your inbox."
        options={EMAIL_NOTIFICATION_OPTIONS}
        preferences={preferences}
        savingKey={savingKey}
        onPreferenceChange={onPreferenceChange}
      />

      <PreferenceSection
        title="In-App Notifications"
        description="Choose which events appear in your Tradexo notification center."
        options={INAPP_NOTIFICATION_OPTIONS}
        preferences={preferences}
        savingKey={savingKey}
        onPreferenceChange={onPreferenceChange}
      />

      <p className={cn("text-sm text-muted-foreground")}>
        Changes save automatically when you toggle a preference.
      </p>
    </div>
  );
}
