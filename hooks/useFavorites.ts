"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getUser } from "@/lib/auth";
import {
  addFavoriteProduct,
  FAVORITE_GUEST_MESSAGE,
  fetchUserFavoriteProductIds,
  removeFavoriteProduct,
} from "@/lib/favorites";

export type FavoritesContextValue = {
  isAuthenticated: boolean;
  loading: boolean;
  guestMessage: string | null;
  isFavorited: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  clearGuestMessage: () => void;
  isToggling: (productId: string) => boolean;
};

export const FavoritesContext = createContext<FavoritesContextValue | null>(
  null
);

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }

  return context;
}

export function useFavoritesState(): FavoritesContextValue {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guestMessage, setGuestMessage] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { data } = await getUser();
      const userId = data.user?.id ?? null;
      userIdRef.current = userId;

      if (cancelled) {
        return;
      }

      if (!userId) {
        setIsAuthenticated(false);
        setFavoriteIds(new Set());
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const { data: ids, error } = await fetchUserFavoriteProductIds(userId);
      if (cancelled) {
        return;
      }

      if (!error) {
        setFavoriteIds(new Set(ids ?? []));
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const isFavorited = useCallback(
    (productId: string) => favoriteIds.has(productId),
    [favoriteIds]
  );

  const isToggling = useCallback(
    (productId: string) => togglingIds.has(productId),
    [togglingIds]
  );

  const clearGuestMessage = useCallback(() => {
    setGuestMessage(null);
  }, []);

  const toggleFavorite = useCallback(async (productId: string) => {
    const userId = userIdRef.current;

    if (!userId) {
      setGuestMessage(FAVORITE_GUEST_MESSAGE);
      return;
    }

    setGuestMessage(null);

    const wasFavorited = favoriteIds.has(productId);

    setFavoriteIds((previous) => {
      const next = new Set(previous);
      if (wasFavorited) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    setTogglingIds((previous) => new Set(previous).add(productId));

    const result = wasFavorited
      ? await removeFavoriteProduct(userId, productId)
      : await addFavoriteProduct(userId, productId);

    setTogglingIds((previous) => {
      const next = new Set(previous);
      next.delete(productId);
      return next;
    });

    if (result.error) {
      setFavoriteIds((previous) => {
        const next = new Set(previous);
        if (wasFavorited) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
    }
  }, [favoriteIds]);

  return useMemo(
    () => ({
      isAuthenticated,
      loading,
      guestMessage,
      isFavorited,
      toggleFavorite,
      clearGuestMessage,
      isToggling,
    }),
    [
      isAuthenticated,
      loading,
      guestMessage,
      isFavorited,
      toggleFavorite,
      clearGuestMessage,
      isToggling,
    ]
  );
}
