"use client";

import Link from "next/link";
import AppShell from "@/components/layout/app-shell";
import PlaceCard from "@/components/cards/place-card";
import { useFavorites } from "@/context/favorites-context";
import { places } from "@/data/nepal";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const favPlaces = places.filter((p) => favorites.includes(p.id));

  return (
    <AppShell>
      {/* Header */}
      <div style={{ padding: "24px 20px 0" }} className="fade-up">
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 4 }}>
          Saved For Later
        </div>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginBottom: 4 }}>
          My Favorites
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 24 }}>
          {favPlaces.length > 0 ? `${favPlaces.length} saved place${favPlaces.length !== 1 ? "s" : ""}` : "Your personal Nepal shortlist"}
        </p>
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        {favPlaces.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="fade-up-1">
            {favPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="fade-up-1" style={{ marginTop: 16 }}>
            {/* Empty state */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              padding: "48px 24px",
              textAlign: "center",
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--bg)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>
                🏔️
              </div>
              <h2 className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
                No saved places yet
              </h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7, maxWidth: 280, margin: "0 auto 28px" }}>
                Tap the heart icon on any place to save it here and build your personal Nepal itinerary.
              </p>
              <Link href="/explore" style={{ background: "var(--jade)", color: "#fff", borderRadius: 999, padding: "12px 28px", fontSize: 14, fontWeight: 700, display: "inline-block", boxShadow: "0 4px 20px var(--jade-glow)" }}>
                Start Exploring
              </Link>
            </div>

            {/* Suggestions */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-muted)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 10 }}>
                Popular to save
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {places.filter((p) => p.isFeatured).slice(0, 3).map((place) => (
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
