"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const STORAGE_KEY = "ghumnp-favorites";
const defaultFavorites = ["pashupatinath", "boudhanath", "himalayan-java"];
const FAVORITES_EVENT = "ghumnp-favorites-change";
const defaultFavoritesString = JSON.stringify(defaultFavorites);
let cachedFavoritesString = defaultFavoritesString;
let cachedFavorites = defaultFavorites;

const FavoritesContext = createContext({
  favorites: defaultFavorites,
  toggleFavorite: () => {},
  isFavorite: () => false,
});

export function FavoritesProvider({ children }) {
  const favorites = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    getServerSnapshot
  );

  function toggleFavorite(id) {
    const current = readFavorites();
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }

  function isFavorite(id) {
    return favorites.includes(id);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}

function readFavorites() {
  if (typeof window === "undefined") {
    return defaultFavorites;
  }

  let saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    window.localStorage.setItem(STORAGE_KEY, defaultFavoritesString);
    saved = defaultFavoritesString;
  }

  if (saved === cachedFavoritesString) {
    return cachedFavorites;
  }

  try {
    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      cachedFavoritesString = saved;
      cachedFavorites = parsed;
      return cachedFavorites;
    }
  } catch {
    window.localStorage.setItem(STORAGE_KEY, defaultFavoritesString);
  }

  cachedFavoritesString = defaultFavoritesString;
  cachedFavorites = defaultFavorites;
  return cachedFavorites;
}

function subscribeToFavorites(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onChange = () => callback();

  window.addEventListener("storage", onChange);
  window.addEventListener(FAVORITES_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(FAVORITES_EVENT, onChange);
  };
}

function getFavoritesSnapshot() {
  return readFavorites();
}

function getServerSnapshot() {
  return defaultFavorites;
}
