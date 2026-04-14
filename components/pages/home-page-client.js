'use client';

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import AppShell from "@/components/layout/app-shell";
// NepalMap is only shown on demand (mobile "Show map" tap) — load it lazily
// so its 1800-line SVG doesn't block the initial JS bundle.
const NepalMap = dynamic(() => import("@/components/ui/nepalmap"), { ssr: false });
import DistrictCard from "@/components/cards/district-card";
import PlaceCard from "@/components/cards/place-card";
import HomeSearch from "@/components/forms/home-search";
// HomeTopPlaces is always below the fold — load it lazily to keep the initial bundle smaller
const HomeTopPlaces = dynamic(() => import("@/components/sections/home-top-places"), {
  ssr: false,
  loading: () => <div style={{ height: 240 }} />,
});
// DesktopHomeLayout uses carousel images whose slide order can only be known
// on the client — SSR-ing it causes a guaranteed hydration mismatch.
// It is wrapped in hidden lg:block so mobile (Lighthouse) never sees a flash.
const DesktopHomeLayout = dynamic(
  () => import("@/components/pages/desktop-home-layout"),
  { ssr: false }
);
import { ChevronRightIcon } from "@/components/ui/icons";
import { contributorSlug } from "@/lib/utils";

const MEDAL = ["🥇", "🥈", "🥉"];

/* ─────────────────────────────────────────────────────────────
   MOBILE HERO
───────────────────────────────────────────────────────────── */
function HeroSection({ initialQuery, carouselImages = [] }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [slide, setSlide] = useState(0);

  // Server already returns ≤5 random slides; slice is a safeguard only
  const slides = carouselImages.slice(0, 5);

  useEffect(() => {
    if (slides.length < 2) return;
    // Respect OS-level "reduce motion" preference
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let t;
    function start() {
      t = setInterval(() => setSlide(s => (s + 1) % slides.length), 3500);
    }
    function handleVisibility() {
      if (document.hidden) { clearInterval(t); t = undefined; }
      else { if (!t) start(); }
    }
    start();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [slides.length]);

  const current = slides[slide];

  return (
    <div className="fade-up" style={{ position: "relative", padding: "0 0 0" }}>
      <div style={{
        margin: "-24px -1px 0",
        padding: "74px 24px 80px",
        borderRadius: "0 0 36px 36px",
        position: "relative",
        overflow: "hidden",
        minHeight: 220,
        background: "#064e35",
      }}>
        {/* All slides are mounted together so the browser can download them in
            the background while slide 0 is visible. Only the active slide is
            shown (opacity 1); the rest are opacity 0 but already in the DOM
            so there is no loading wait when the carousel advances.
            Slide 0 gets priority; slides 1-4 load eagerly in the background. */}
        {slides.map((img, i) => (
          <div
            key={i}
            style={{
              position: "absolute", inset: 0,
              filter: mapOpen ? "blur(8px) brightness(0.55)" : "none",
              zIndex: 0,
              opacity: i === slide ? 1 : 0,
              transition: "opacity 0.8s ease",
            }}
            aria-hidden={i !== slide}
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

        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to bottom, rgba(4,40,24,0.62) 0%, rgba(5,150,105,0.45) 60%, rgba(4,40,24,0.75) 100%)",
          borderRadius: "0 0 36px 36px",
        }} />

        {/* White gradient at top — logo sits on this */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 104,
          background: "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.65) 60%, rgba(255,255,255,0) 100%)",
          zIndex: 2, pointerEvents: "none",
        }} />

        {/* Logo centred over the white gradient */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          height: 74,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 3,
        }}>
          <div style={{ width: 160, height: 56, position: "relative" }}>
            {/* unoptimized: local PNG, custom CDN loader cannot resize public-dir files */}
            <Image src="/logo.png" alt="visitNepal77" fill sizes="160px" style={{ objectFit: "contain" }} priority unoptimized />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", zIndex: 2 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 3, letterSpacing: "-0.02em", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            Discover Nepal&apos;s{" "}<span style={{ color: "#86efac" }}>77 Districts</span>
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginBottom: 8, lineHeight: 1.4, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
            Real places, local guides &amp; hidden gems.
          </p>

          {carouselImages.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, marginBottom: 8 }}>
              {current?.label && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", background: "rgba(0,0,0,0.35)", borderRadius: 999, padding: "2px 10px", backdropFilter: "blur(4px)", letterSpacing: "0.03em" }}>
                  📍 {current.label}
                </span>
              )}
              <div style={{ display: "flex", gap: 5 }}>
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} style={{ width: i === slide ? 18 : 6, height: 6, borderRadius: 999, background: i === slide ? "#86efac" : "rgba(255,255,255,0.45)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }} />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setMapOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 999, padding: "4px 14px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", marginBottom: mapOpen ? 8 : 0, transition: "all 0.2s" }}
            aria-label={mapOpen ? "Collapse map" : "Expand map"}
          >
            {mapOpen ? "▲ Hide map" : "▼ Show map"}
          </button>

          {mapOpen && (
            <div className="nepal-map-wrapper" style={{ transition: "all 0.3s" }}>
              <NepalMap />
            </div>
          )}
        </div>
      </div>

      <div style={{ margin: "-28px 16px 0", position: "relative", zIndex: 10 }}>
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 32px rgba(6,78,53,0.18)", overflow: "hidden" }}>
          <HomeSearch initialQuery={initialQuery} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────────────────────── */
export default function HomePageClient({
  featuredDistricts,
  carouselSlides = [],
  popularDistricts = [],
  topPlaces,
  topContributors = [],
  initialQuery = "",
}) {
  // Slides arrive pre-shuffled from the server component (page.js).
  // Using them directly — no client-side shuffle — keeps server HTML and
  // client hydration identical, eliminating the hydration mismatch.
  const slides = carouselSlides.length > 0
    ? carouselSlides
    : featuredDistricts.filter(d => d.image).map(d => ({ src: d.image, label: d.name })).slice(0, 5);

  return (
    <AppShell showTopBar={false} className="bg-transparent">

      {/* ── DESKTOP layout (lg+) ─────────────────────────────── */}
      <div className="hidden lg:block">
        <DesktopHomeLayout
          featuredDistricts={featuredDistricts}
          popularDistricts={popularDistricts}
          topPlaces={topPlaces}
          topContributors={topContributors}
          initialQuery={initialQuery}
          slides={slides}
        />
      </div>

      {/* ── MOBILE layout (< lg) — untouched ────────────────── */}
      <div className="lg:hidden">

        <HeroSection initialQuery={initialQuery} carouselImages={slides} />

        {/* Quick Stats */}
        <div className="fade-up-1 scrollbar-hide" style={{ display: "flex", gap: 10, padding: "20px 20px 0", overflowX: "auto" }}>
          {[
            { icon: "🏔️", value: "77",   label: "Districts"   },
            { icon: "📍", value: "500+", label: "Places"      },
            { icon: "⭐", value: "Real", label: "Reviews"     },
            { icon: "💎", value: "Local",label: "Hidden Gems" },
          ].map(({ icon, value, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "12px 16px", minWidth: 76, flexShrink: 0, boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#059669", marginTop: 4, lineHeight: 1 }}>{value}</span>
              <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, marginTop: 2, letterSpacing: "0.04em" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Featured Districts */}
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

        {/* Leaderboard Widget */}
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
              <div style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%)", padding: "14px 16px 12px", borderBottom: "1px solid #fde68a", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🏆</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#92400e", lineHeight: 1.1 }}>This Month&apos;s Leaders</p>
                  <p style={{ fontSize: 11, color: "#b45309", marginTop: 1 }}>Top place contributors in Nepal</p>
                </div>
              </div>

              {topContributors.map((contributor, idx) => (
                <Link key={contributor.id} href={`/contributors/${contributorSlug(contributor.name, contributor.id)}`}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", textDecoration: "none", borderBottom: idx < topContributors.length - 1 ? "1px solid #f1f5f9" : "none", background: idx === 0 ? "linear-gradient(90deg, rgba(5,150,105,0.04) 0%, transparent 100%)" : "#fff" }}
                >
                  <span style={{ fontSize: idx === 0 ? 26 : 20, width: 30, textAlign: "center", flexShrink: 0, lineHeight: 1 }}>{MEDAL[idx]}</span>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: idx === 0 ? "2.5px solid #059669" : "2px solid #e2e8f0", background: "#d1fae5" }}>
                    {contributor.avatar_url ? (
                      <Image src={contributor.avatar_url} alt={contributor.name} width={42} height={42} style={{ width: 42, height: 42, objectFit: "cover", display: "block" }} />
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
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: 999, padding: "4px 10px", border: "1px solid #bbf7d0", flexShrink: 0 }}>#1</span>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#6b7280", flexShrink: 0 }}>#{idx + 1}</span>
                  )}
                </Link>
              ))}

              <Link href="/leaderboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#059669", textDecoration: "none", background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
                See full leaderboard <ChevronRightIcon className="size-4" />
              </Link>
            </div>
          </section>
        ) : null}

        {/* Popular Districts */}
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

        {/* Top Places */}
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

        {/* Browse by Type — crawlable hub links to typed category pages */}
        <section style={{ marginTop: 28, padding: "0 20px" }}>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#059669", marginBottom: 3 }}>Browse by Type</p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.15, letterSpacing: "-0.02em" }}>What are you looking for?</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { href: "/places/kathmandu/attraction", label: "Attractions",  emoji: "🏛️", sub: "in Kathmandu" },
              { href: "/places/kathmandu/restaurant", label: "Restaurants",  emoji: "🍽️", sub: "in Kathmandu" },
              { href: "/places/pokhara/attraction",   label: "Attractions",  emoji: "⛰️", sub: "in Pokhara"   },
              { href: "/places/pokhara/hotel",        label: "Hotels",       emoji: "🏨", sub: "in Pokhara"   },
              { href: "/places/chitwan/attraction",   label: "Attractions",  emoji: "🐘", sub: "in Chitwan"   },
              { href: "/places/lalitpur/food",        label: "Local Food",   emoji: "🍜", sub: "in Lalitpur"  },
            ].map(({ href, label, emoji, sub }) => (
              <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 14px", textDecoration: "none", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                <span style={{ fontSize: 22 }}>{emoji}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{label}</p>
                  <p style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Contribute CTA */}
        <div className="fade-up-4" style={{ margin: "28px 20px 8px" }}>
          <div style={{ background: "linear-gradient(135deg, #064e35 0%, #059669 100%)", borderRadius: 24, padding: "28px 24px", position: "relative", overflow: "hidden" }}>
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
                <Link href="/add" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: "#059669", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
                  + Add a Place
                </Link>
                <Link href="/leaderboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 999, padding: "11px 20px", fontSize: 13, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)" }}>
                  View Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
      {/* end mobile */}

    </AppShell>
  );
}
