"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AUTH_COOKIE_NAME = "prescriptoai_token";
const STORAGE_KEY = "ghumnp-favorites";
const defaultFavorites = [];

const FavoritesContext = createContext({
  favorites: defaultFavorites,
  isFavorite: () => false,
  toggleFavorite: async () => {},
  authenticated: false,
  loaded: false,
});

export function FavoritesProvider({
  children,
  initialFavorites = defaultFavorites,
  initialAuthenticated = false,
}) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      // Always try to detect auth cookie first
      const hasAuthCookie =
        typeof document !== "undefined" &&
        document.cookie
          .split(";")
          .some((c) => c.trim().startsWith(`${AUTH_COOKIE_NAME}=`));

      if (!initialAuthenticated && !hasAuthCookie) {
        // Unauthenticated — load from localStorage
        const local = readLocalFavorites();
        if (!cancelled) {
          setFavorites(local);
          setAuthenticated(false);
          setLoaded(true);
        }
        return;
      }

      // Authenticated — fetch from server
      try {
        const response = await fetch("/api/favorites", {
          cache: "no-store",
          credentials: "same-origin",
        });
        const data = await response.json();
        if (cancelled) return;

        if (data?.authenticated) {
          const serverFavorites = data.favorites || [];
          setFavorites(serverFavorites);
          setAuthenticated(true);
          // Cache in localStorage so we have a fallback if the session expires
          persistLocalFavorites(serverFavorites);
        } else {
          // Session expired — fall back to cached localStorage favorites
          const local = readLocalFavorites();
          setFavorites(local);
          setAuthenticated(false);
        }
        setLoaded(true);
      } catch {
        // Network error — fall back to local
        const local = readLocalFavorites();
        if (!cancelled) {
          setFavorites(local);
          setLoaded(true);
        }
      }
    }

    loadFavorites();
    return () => { cancelled = true; };
  }, [initialAuthenticated]);

  const isFavorite = useCallback(
    (id) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (id) => {
      const isCurrentlyFavorite = favorites.includes(id);

      // Optimistic update
      const next = isCurrentlyFavorite
        ? favorites.filter((item) => item !== id)
        : [...favorites, id];

      setFavorites(next);

      if (!authenticated) {
        // Unauthenticated — persist locally only
        persistLocalFavorites(next);
        return { ok: true, saved: !isCurrentlyFavorite };
      }

      // Authenticated — sync to server
      try {
        let response;
        if (isCurrentlyFavorite) {
          response = await fetch(
            `/api/favorites?placeId=${encodeURIComponent(id)}`,
            { method: "DELETE", credentials: "same-origin" }
          );
        } else {
          response = await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ placeId: id }),
          });
        }

        if (!response.ok) {
          // Revert optimistic update on server error
          setFavorites((prev) =>
            prev.includes(id)
              ? prev.filter((item) => item !== id)
              : [...prev, id]
          );
          const errData = await response.json().catch(() => ({}));
          return { ok: false, error: errData?.error || "Failed" };
        }

        // Keep localStorage in sync as a cache for authenticated users
        persistLocalFavorites(next);
        return { ok: true, saved: !isCurrentlyFavorite };
      } catch {
        // Revert on network error
        setFavorites((prev) =>
          prev.includes(id)
            ? prev.filter((item) => item !== id)
            : [...prev, id]
        );
        return { ok: false, error: "Network error" };
      }
    },
    [favorites, authenticated]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, authenticated, loaded }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}

function readLocalFavorites() {
  if (typeof window === "undefined") return defaultFavorites;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultFavorites;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultFavorites;
  } catch {
    return defaultFavorites;
  }
}

function persistLocalFavorites(favorites) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}
