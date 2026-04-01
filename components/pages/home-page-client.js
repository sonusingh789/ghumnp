'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AppShell from "@/components/layout/app-shell";
import NepalMap from "@/components/ui/nepalmap";
import DistrictCard from "@/components/cards/district-card";
import HomeSearch from "@/components/forms/home-search";
import HomeTopPlaces from "@/components/sections/home-top-places";
import { ChevronRightIcon } from "@/components/ui/icons";

const MEDAL = ["🥇", "🥈", "🥉"];

function contributorSlug(name, id) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${id}`;
}

function HeroSection({ initialQuery, carouselImages = [] }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [slide, setSlide] = useState(0);

  // Auto-advance carousel every 3.5 s
  useEffect(() => {
    if (carouselImages.length < 2) return;
    const t = setInterval(() => setSlide(s => (s + 1) % carouselImages.length), 3500);
    return () => clearInterval(t);
  }, [carouselImages.length]);

  const current = carouselImages[slide];

  return (
    <div className="fade-up" style={{ position: "relative", padding: "0 0 0" }}>
      {/* Banner */}
      <div style={{
        margin: "-24px -1px 0",
        padding: "20px 24px 80px",
        borderRadius: "0 0 36px 36px",
        position: "relative",
        overflow: "hidden",
        minHeight: 220,
        background: "#064e35", // fallback if no images
      }}>
        {/* Carousel background images — blurred when map is visible */}
        {carouselImages.map((img, i) => (
          <div
            key={img.src}
            style={{
              position: "absolute", inset: 0,
              opacity: i === slide ? 1 : 0,
              transition: "opacity 0.8s ease, filter 0.4s ease",
              filter: mapOpen ? "blur(8px) brightness(0.55)" : "none",
              zIndex: 0,
            }}
          >
            <Image
              src={img.src}
              alt={img.label}
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}

        {/* Dark gradient overlay for readability */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to bottom, rgba(4,40,24,0.62) 0%, rgba(5,150,105,0.45) 60%, rgba(4,40,24,0.75) 100%)",
          borderRadius: "0 0 36px 36px",
        }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", zIndex: 2 }}>
          {/* Logo */}
          <div style={{ marginBottom: 0, width: 180, height: 180, position: "relative" }}>
            <Image src="/logo.png" alt="GhumnP" fill sizes="180px" style={{ objectFit: "contain" }} priority />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 3, letterSpacing: "-0.02em", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            Discover Nepal&apos;s{" "}<span style={{ color: "#86efac" }}>77 Districts</span>
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginBottom: 8, lineHeight: 1.4, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
            Real places, local guides &amp; hidden gems.
          </p>

          {/* Slide label + dot indicators */}
          {carouselImages.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, marginBottom: 8 }}>
              {current?.label && (
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)",
                  background: "rgba(0,0,0,0.35)", borderRadius: 999,
                  padding: "2px 10px", backdropFilter: "blur(4px)",
                  letterSpacing: "0.03em",
                }}>📍 {current.label}</span>
              )}
              <div style={{ display: "flex", gap: 5 }}>
                {carouselImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                    style={{
                      width: i === slide ? 18 : 6, height: 6,
                      borderRadius: 999,
                      background: i === slide ? "#86efac" : "rgba(255,255,255,0.45)",
                      border: "none", cursor: "pointer", padding: 0,
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Map collapse toggle */}
          <button
            onClick={() => setMapOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: 999, padding: "4px 14px",
              fontSize: 12, fontWeight: 700, color: "#fff",
              cursor: "pointer", marginBottom: mapOpen ? 8 : 0,
              transition: "all 0.2s",
            }}
            aria-label={mapOpen ? "Collapse map" : "Expand map"}
          >
            {mapOpen ? "▲ Hide map" : "▼ Show map"}
          </button>

          {/* Nepal Map — collapsible */}
          {mapOpen && (
            <div className="nepal-map-wrapper" style={{ transition: "all 0.3s" }}>
              <NepalMap />
            </div>
          )}
        </div>
      </div>

      {/* Search pill — floats over the banner */}
      <div style={{ margin: "-28px 16px 0", position: "relative", zIndex: 10 }}>
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 32px rgba(6,78,53,0.18)", overflow: "hidden" }}>
          <HomeSearch initialQuery={initialQuery} />
        </div>
      </div>
    </div>
  );
}


export default function HomePageClient({
  featuredDistricts,
  allDistricts = [],
  popularDistricts = [],
  topPlaces,
  topContributors = [],
  initialQuery = "",
}) {
  // Maintain stable order for SSR, and shuffle only on the client
  const [slides, setSlides] = useState(() => {
    const pool = (allDistricts.length > 0 ? allDistricts : featuredDistricts)
      .filter(d => d.image)
      .map(d => ({ src: d.image, label: d.name }));
    return pool.slice(0, 12);
  });

  useEffect(() => {
    const pool = (allDistricts.length > 0 ? allDistricts : featuredDistricts)
      .filter(d => d.image)
      .map(d => ({ src: d.image, label: d.name }));

    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setSlides(pool.slice(0, 12));
  }, [allDistricts, featuredDistricts]);

  return (
    <AppShell showTopBar={false} className="bg-transparent">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <HeroSection initialQuery={initialQuery} carouselImages={slides} />

      {/* ── QUICK STATS ──────────────────────────────────────── */}
      <div className="fade-up-1 scrollbar-hide" style={{ display: "flex", gap: 10, padding: "20px 20px 0", overflowX: "auto" }}>
        {[
          { icon: "🏔️", value: "77", label: "Districts" },
          { icon: "📍", value: "500+", label: "Places" },
          { icon: "⭐", value: "Real", label: "Reviews" },
          { icon: "💎", value: "Local", label: "Hidden Gems" },
        ].map(({ icon, value, label }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "12px 16px", minWidth: 76, flexShrink: 0, boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#059669", marginTop: 4, lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginTop: 2, letterSpacing: "0.04em" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── FEATURED DISTRICTS ───────────────────────────────── */}
      <section className="fade-up-2" style={{ marginTop: 28, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 20px", marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#059669", marginBottom: 3 }}>Explore</p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.15, letterSpacing: "-0.02em" }}>Featured Districts</h2>
          </div>
          <Link href="/districts" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700, color: "#059669", textDecoration: "none" }}>
            All 77 <ChevronRightIcon className="size-4" />
          </Link>
        </div>
        <div className="scrollbar-hide mobile-h-scroll" style={{ display: "flex", gap: 12, padding: "4px 20px 8px" }}>
          {featuredDistricts.map((district, i) => (
            <DistrictCard key={district.id} district={district} compact imagePriority={i === 0} />
          ))}
        </div>
      </section>

      {/* ── LEADERBOARD WIDGET ───────────────────────────────── */}
      {topContributors.length > 0 ? (
        <section className="fade-up-3" style={{ padding: "20px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d97706", marginBottom: 3 }}>Community</p>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.15, letterSpacing: "-0.02em" }}>Top Contributors</h2>
            </div>
            <Link href="/leaderboard" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700, color: "#059669", textDecoration: "none" }}>
              Leaderboard <ChevronRightIcon className="size-4" />
            </Link>
          </div>

          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 20px rgba(15,23,42,0.06)" }}>
            {/* Podium header strip */}
            <div style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%)", padding: "14px 16px 12px", borderBottom: "1px solid #fde68a", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>🏆</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#92400e", lineHeight: 1.1 }}>This Month&apos;s Leaders</p>
                <p style={{ fontSize: 11, color: "#b45309", marginTop: 1 }}>Top place contributors in Nepal</p>
              </div>
            </div>

            {topContributors.map((contributor, idx) => (
              <Link
                key={contributor.id}
                href={`/contributors/${contributorSlug(contributor.name, contributor.id)}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 16px",
                  textDecoration: "none",
                  borderBottom: idx < topContributors.length - 1 ? "1px solid #f1f5f9" : "none",
                  background: idx === 0 ? "linear-gradient(90deg, rgba(5,150,105,0.04) 0%, transparent 100%)" : "#fff",
                }}
              >
                <span style={{ fontSize: idx === 0 ? 26 : 20, width: 30, textAlign: "center", flexShrink: 0, lineHeight: 1 }}>{MEDAL[idx]}</span>
                <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: idx === 0 ? "2.5px solid #059669" : "2px solid #e2e8f0", background: "#d1fae5", position: "relative" }}>
                  {contributor.avatar_url ? (
                    <Image src={contributor.avatar_url} alt={contributor.name} fill sizes="42px" className="object-cover" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#059669" }}>
                      {contributor.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{contributor.name}</p>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{contributor.contributions} approved places</p>
                </div>
                {idx === 0 ? (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: 999, padding: "4px 10px", border: "1px solid #bbf7d0", flexShrink: 0 }}>
                    #1
                  </span>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#94a3b8", flexShrink: 0 }}>#{idx + 1}</span>
                )}
              </Link>
            ))}

            <Link
              href="/leaderboard"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#059669", textDecoration: "none", background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}
            >
              See full leaderboard <ChevronRightIcon className="size-4" />
            </Link>
          </div>
        </section>
      ) : null}

      {/* ── POPULAR DISTRICTS ────────────────────────────────── */}
      {popularDistricts.length ? (
        <section className="fade-up-3" style={{ marginTop: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 20px", marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d97706", marginBottom: 3 }}>Trending</p>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.15, letterSpacing: "-0.02em" }}>Popular Districts</h2>
            </div>
            <Link href="/districts" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700, color: "#059669", textDecoration: "none" }}>
              View all <ChevronRightIcon className="size-4" />
            </Link>
          </div>
          <div className="scrollbar-hide mobile-h-scroll" style={{ display: "flex", gap: 12, padding: "4px 20px 8px" }}>
            {popularDistricts.map((district, i) => (
              <DistrictCard key={`popular-${district.id}`} district={district} compact imagePriority={i === 0} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── TOP PLACES ───────────────────────────────────────── */}
      <section className="fade-up-4" style={{ marginTop: 28, padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#059669", marginBottom: 3 }}>Must Visit</p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.15, letterSpacing: "-0.02em" }}>Top Places</h2>
          </div>
          <Link href="/allplaces" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700, color: "#059669", textDecoration: "none" }}>
            View all <ChevronRightIcon className="size-4" />
          </Link>
        </div>
        <HomeTopPlaces places={topPlaces} />
      </section>

      {/* ── CONTRIBUTE CTA ───────────────────────────────────── */}
      <div className="fade-up-4" style={{ margin: "28px 20px 8px" }}>
        <div style={{
          background: "linear-gradient(135deg, #064e35 0%, #059669 100%)",
          borderRadius: 24,
          padding: "28px 24px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <span style={{ fontSize: 32 }}>🗺️</span>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 10, marginBottom: 6, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              Know a hidden gem?
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", marginBottom: 18, lineHeight: 1.6 }}>
              Help travelers discover Nepal. Add a place and earn contributor badges.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                href="/add"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: "#059669", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}
              >
                + Add a Place
              </Link>
              <Link
                href="/leaderboard"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 999, padding: "11px 20px", fontSize: 13, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)" }}
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>

    </AppShell>
  );
}
