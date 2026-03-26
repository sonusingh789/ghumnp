"use client";

import Link from "next/link";
import Image from "next/image";
import { useDeferredValue, useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import DistrictCard from "@/components/cards/district-card";
import PlaceCard from "@/components/cards/place-card";
import { ChevronRightIcon } from "@/components/ui/icons";
import { buildLoginHref } from "@/utils/navigation";

export default function HomePageClient({
  featuredDistricts,
  allPlaces,
  userProfile,
  initialAuthUser,
}) {
  const [query, setQuery] = useState("");
  const [authUser, setAuthUser] = useState(initialAuthUser || null);
  const [authReady, setAuthReady] = useState(true);
  const deferredQuery = useDeferredValue(query);
  const search = deferredQuery.trim().toLowerCase();

  const visiblePlaces = search
    ? allPlaces.filter(
        (place) =>
          place.name.toLowerCase().includes(search) ||
          place.description.toLowerCase().includes(search) ||
          place.location.toLowerCase().includes(search)
      )
    : allPlaces.filter((place) => place.isFeatured).slice(0, 4);
  const hiddenGems = allPlaces.filter((place) => place.isHidden).slice(0, 4);

  useEffect(() => {
    let cancelled = false;

    async function loadAuthUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json().catch(() => ({}));

        if (!cancelled) {
          setAuthUser(response.ok ? data.user || null : null);
          setAuthReady(true);
        }
      } catch {
        if (!cancelled) {
          setAuthUser(null);
          setAuthReady(true);
        }
      }
    }

    loadAuthUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <header
        style={{
          padding: "20px 20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="fade-up"
      >
        <div>
          <div style={{ marginBottom: 4 }}>
            <Image src="/logo.png" alt="visitNepal77 - logo" width={200} height={50} />
          </div>
          
        </div>
        {authReady && authUser ? (
          <Link href="/profile">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid var(--jade-soft)",
                boxShadow: "0 2px 12px var(--jade-glow)",
                position: "relative",
              }}
            >
              <Image
                src={userProfile.avatar}
                alt={authUser.name || userProfile.name}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
          </Link>
        ) : (
          <Link
            href={buildLoginHref("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 44,
              borderRadius: 999,
              padding: "0 10px 0 8px",
              background: "rgba(255,255,255,0.82)",
              color: "var(--ink)",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.01em",
              boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
              border: "1px solid rgba(15,23,42,0.08)",
              backdropFilter: "blur(14px)",
              gap: 10,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                width: 30,
                height: 30,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #17b26a 0%, #0f9f58 100%)",
                color: "#fff",
                fontSize: 14,
                boxShadow: "0 8px 18px rgba(15,159,88,0.25)",
              }}
            >
              →
            </span>
            Login
          </Link>
        )}
      </header>

      <div style={{ padding: "16px 20px 0" }} className="fade-up-1">
        <label style={{ position: "relative", display: "block" }}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 18,
              height: 18,
              color: "var(--ink-faint)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search districts, places, foods..."
            style={{
              width: "100%",
              padding: "14px 16px 14px 44px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--border-strong)",
              background: "var(--bg-card)",
              fontSize: 14,
              color: "var(--ink)",
              outline: "none",
              boxShadow: "var(--shadow-sm)",
            }}
          />
        </label>
      </div>

      <div style={{ padding: "24px 0 0" }}>
        <section className="fade-up-2" style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--jade)",
                  marginBottom: 2,
                }}
              >
                Popular
              </div>
              <h2 className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>
                Featured Districts
              </h2>
            </div>
            <Link
              href="/districts"
              style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 13, fontWeight: 600, color: "var(--jade)" }}
            >
              All 77 <ChevronRightIcon className="size-4" />
            </Link>
          </div>
          <div className="scrollbar-hide mobile-h-scroll" style={{ display: "flex", gap: 12, padding: "4px 20px 8px" }}>
            {featuredDistricts.map((district) => (
              <DistrictCard key={district.id} district={district} compact />
            ))}
          </div>
        </section>

        <section className="fade-up-3" style={{ marginBottom: 32, padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: 2,
                }}
              >
                Must Visit
              </div>
              <h2 className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>
                Top Places
              </h2>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visiblePlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>

        {!search ? (
          <section className="fade-up-4" style={{ padding: "0 20px", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 18, height: 18, color: "var(--gold)" }}
              >
                <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z" />
                <path d="m18.5 14.5.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
              </svg>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                  }}
                >
                  Off the beaten path
                </div>
                <h2 className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>
                  Hidden Gems
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {hiddenGems.map((place) => (
                <PlaceCard key={place.id} place={place} layout="grid" />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
