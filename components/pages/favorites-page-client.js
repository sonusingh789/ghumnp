"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/app-shell";
import PlaceCard from "@/components/cards/place-card";
import DistrictCard from "@/components/cards/district-card";
import { useFavorites } from "@/context/favorites-context";

export default function FavoritesPageClient({
  initialFavoritePlaces = [],
  initialFavoriteDistricts = [],
  initialSuggestions = [],
}) {
  const { favorites } = useFavorites();
  const [favPlaces, setFavPlaces] = useState(initialFavoritePlaces);
  const [favDistricts, setFavDistricts] = useState(initialFavoriteDistricts);
  const [suggestions] = useState(initialSuggestions);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    let cancelled = false;

    async function loadFavorites() {
      const response = await fetch("/api/favorites", {
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!cancelled) {
        setFavPlaces(data.favoritePlaces || []);
        setFavDistricts(data.favoriteDistricts || []);
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [favorites]);

  const totalSaved = favPlaces.length + favDistricts.length;

  return (
    <AppShell>
      <div style={{ padding: "24px 20px 0" }} className="fade-up">
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--jade)",
            marginBottom: 4,
          }}
        >
          Saved For Later
        </div>
        <h1
          className="display"
          style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginBottom: 4 }}
        >
          My Favorites
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 24 }}>
          {totalSaved > 0
            ? `${totalSaved} saved item${totalSaved !== 1 ? "s" : ""} across places and districts`
            : "Your personal Nepal shortlist"}
        </p>
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        {totalSaved ? (
          <div className="fade-up-1" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {favDistricts.length ? (
              <section>
                <div
                  style={{
                    color: "var(--ink-muted)",
                    marginBottom: 14,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  Saved Districts
                </div>
                <div style={{ display: "grid", gap: 14 }}>
                  {favDistricts.map((district) => (
                    <DistrictCard key={district.id} district={district} />
                  ))}
                </div>
              </section>
            ) : null}

            {favPlaces.length ? (
              <section>
                <div
                  style={{
                    color: "var(--ink-muted)",
                    marginBottom: 14,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  Saved Places
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {favPlaces.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <div className="fade-up-1" style={{ marginTop: 16 }}>
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-xl)",
                padding: "48px 24px",
                textAlign: "center",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h2
                className="display"
                style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}
              >
                No saved items yet
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--ink-muted)",
                  lineHeight: 1.7,
                  maxWidth: 320,
                  margin: "0 auto 28px",
                }}
              >
                Tap the heart icon on any district or place to save it here and build your personal Nepal itinerary.
              </p>
              <Link
                href="/explore"
                style={{
                  background: "var(--jade)",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "12px 28px",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "inline-block",
                  boxShadow: "0 4px 20px var(--jade-glow)",
                }}
              >
                Start Exploring
              </Link>
            </div>

            <div style={{ marginTop: 28 }}>
              <div
                style={{
                  color: "var(--ink-muted)",
                  marginBottom: 14,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                Popular to save
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {suggestions.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
