"use client";

import {
  FavoritesContext,
  useFavoritesState,
} from "@/hooks/useFavorites";

export default function FavoritesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useFavoritesState();

  return (
    <FavoritesContext.Provider value={value}>
      {children}
      {value.guestMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border bg-card px-4 py-3 text-sm text-foreground shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <p>{value.guestMessage}</p>
            <button
              type="button"
              onClick={value.clearGuestMessage}
              className="shrink-0 font-medium text-blue-600 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </FavoritesContext.Provider>
  );
}
