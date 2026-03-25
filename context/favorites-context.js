"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "ghumnp-favorites";
const defaultFavorites = ["pashupatinath", "boudhanath", "himalayan-java"];

const FavoritesContext = createContext({
  favorites: defaultFavorites,
  isFavorite: () => false,
  toggleFavorite: async () => {},
  authenticated: false,
});

export function FavoritesProvider({
  children,
  initialFavorites = defaultFavorites,
  initialAuthenticated = false,
}) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      try {
        const response = await fetch("/api/favorites", { cache: "no-store" });
        const data = await response.json();

        if (cancelled) return;

        if (data?.authenticated) {
          setFavorites(data.favorites || []);
          setAuthenticated(true);
          return;
        }
      } catch {
      }

      if (cancelled) return;
      const localFavorites = readLocalFavorites();
      setFavorites(localFavorites);
      setAuthenticated(false);
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, []);

  function isFavorite(id) {
    return favorites.includes(id);
  }

  async function toggleFavorite(id) {
    const next = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];

    setFavorites(next);

    if (!authenticated) {
      persistLocalFavorites(next);
      return;
    }

    try {
      if (favorites.includes(id)) {
        await fetch(`/api/favorites?placeId=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ placeId: id }),
        });
      }
    } catch {
      setFavorites(favorites);
    }
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, authenticated }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}

function readLocalFavorites() {
  if (typeof window === "undefined") {
    return defaultFavorites;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    persistLocalFavorites(defaultFavorites);
    return defaultFavorites;
  }

  try {
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
