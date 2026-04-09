'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AppShell from "@/components/layout/app-shell";
import NepalMap from "@/components/ui/nepalmap";
import DistrictCard from "@/components/cards/district-card";
import PlaceCard from "@/components/cards/place-card";
import HomeSearch from "@/components/forms/home-search";
import HomeTopPlaces from "@/components/sections/home-top-places";
import { ChevronRightIcon } from "@/components/ui/icons";

const MEDAL = ["🥇", "🥈", "🥉"];

function contributorSlug(name, id) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${id}`;
}

/* ─────────────────────────────────────────────────────────────
   MOBILE HERO (unchanged)
───────────────────────────────────────────────────────────── */
function HeroSection({ initialQuery, carouselImages = [] }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (carouselImages.length < 2) return;
    const t = setInterval(() => setSlide(s => (s + 1) % carouselImages.length), 3500);
    return () => clearInterval(t);
  }, [carouselImages.length]);

  const current = carouselImages[slide];

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
            <Image src="/logo.png" alt="visitNepal77" fill sizes="160px" style={{ objectFit: "contain" }} priority />
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
                {carouselImages.map((_, i) => (
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
   DESKTOP — Section header helper
───────────────────────────────────────────────────────────── */
function SectionHeader({ eyebrow, eyebrowColor = "#059669", title, link, linkLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
      <div>
        {eyebrow && (
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: eyebrowColor, marginBottom: 4 }}>
            {eyebrow}
          </p>
        )}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
          {title}
        </h2>
      </div>
      {link && (
        <Link href={link} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 13, fontWeight: 700, color: "#059669", textDecoration: "none", opacity: 0.9 }}>
          {linkLabel} <ChevronRightIcon className="size-4" />
        </Link>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DESKTOP HOME LAYOUT
   Completely separate from mobile — shown only on lg+ screens
───────────────────────────────────────────────────────────── */
function DesktopHomeLayout({ featuredDistricts, popularDistricts, topPlaces, topContributors, initialQuery, slides }) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[slide];

  return (
    <div style={{ paddingBottom: 60 }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        height: 480,
        borderRadius: "0 0 32px 32px",
        overflow: "hidden",
        marginBottom: 40,
      }}>
        {/* Carousel images */}
        {slides.map((img, i) => (
          <div key={img.src} style={{
            position: "absolute", inset: 0,
            opacity: i === slide ? 1 : 0,
            transition: "opacity 1.2s ease",
            zIndex: 0,
          }}>
            <Image
              src={img.src}
              alt={img.label}
              fill
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
              priority={i === 0}
            />
          </div>
        ))}

        {/* Gradient overlay — more gradient on left for text legibility */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(105deg, rgba(4,40,24,0.88) 0%, rgba(4,40,24,0.65) 45%, rgba(4,40,24,0.2) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to top, rgba(4,40,24,0.6) 0%, transparent 50%)",
        }} />

        {/* Hero text + search */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, zIndex: 2,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "0 52px",
          width: 620,
        }}>
          <div style={{ marginBottom: 18 }}>
            <h1 style={{ fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1.0, letterSpacing: "-0.03em", textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}>
              Discover Nepal&apos;s<br />
              <span style={{ color: "#86efac" }}>77 Districts</span>
            </h1>
          </div>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 28, lineHeight: 1.65, maxWidth: 420 }}>
            Real places, local guides &amp; hidden gems — across every corner of Nepal.
          </p>

          {/* Search */}
          <div style={{ width: "100%", maxWidth: 500, background: "#fff", borderRadius: 18, boxShadow: "0 10px 44px rgba(0,0,0,0.28)", overflow: "hidden" }}>
            <HomeSearch initialQuery={initialQuery} />
          </div>

          {/* Slide dots */}
          {slides.length > 1 && (
            <div style={{ display: "flex", gap: 6, marginTop: 22 }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  style={{
                    width: i === slide ? 24 : 6, height: 6,
                    borderRadius: 999, border: "none", padding: 0,
                    background: i === slide ? "#86efac" : "rgba(255,255,255,0.38)",
                    cursor: "pointer", transition: "all 0.35s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Current slide label — bottom right */}
        {current?.label && (
          <div style={{ position: "absolute", bottom: 22, right: 28, zIndex: 2 }}>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: "rgba(255,255,255,0.92)",
              background: "rgba(0,0,0,0.42)",
              borderRadius: 999, padding: "5px 14px",
              backdropFilter: "blur(8px)",
              letterSpacing: "0.02em",
            }}>
              📍 {current.label}
            </span>
          </div>
        )}
      </div>

      {/* ── STATS ROW ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, padding: "0 2px", marginBottom: 44 }}>
        {[
          { icon: "🏔️", value: "77",   label: "Districts"   },
          { icon: "📍", value: "500+", label: "Places"      },
          { icon: "⭐", value: "Real", label: "Reviews"     },
          { icon: "💎", value: "Local",label: "Hidden Gems" },
        ].map(({ icon, value, label }) => (
          <div key={label} style={{
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 18,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 2px 14px rgba(15,23,42,0.05)",
          }}>
            <span style={{ fontSize: 30 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#059669", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FEATURED DISTRICTS — 3-column grid ───────────────── */}
      <section style={{ marginBottom: 48 }}>
        <SectionHeader eyebrow="Explore" title="Featured Districts" link="/districts" linkLabel="All 77" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {featuredDistricts.slice(0, 6).map((d, i) => (
            <DistrictCard key={d.id} district={d} imagePriority={i < 3} />
          ))}
        </div>
      </section>

      {/* ── TWO-COLUMN LAYOUT: main content + aside ──────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 30, alignItems: "start" }}>

        {/* ── MAIN COLUMN ─────────────────────────────────────── */}
        <div>

          {/* Popular Districts */}
          {popularDistricts.length > 0 && (
            <section style={{ marginBottom: 48 }}>
              <SectionHeader eyebrow="Trending" eyebrowColor="#d97706" title="Popular Districts" link="/districts" linkLabel="View all" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
                {popularDistricts.slice(0, 4).map((d, i) => (
                  <DistrictCard key={`pop-${d.id}`} district={d} imagePriority={i === 0} />
                ))}
              </div>
            </section>
          )}

          {/* Top Places */}
          <section>
            <SectionHeader eyebrow="Must Visit" title="Top Places" link="/allplaces" linkLabel="View all" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {topPlaces.slice(0, 8).map((p, i) => (
                <PlaceCard key={p.id} place={p} layout="grid" imagePriority={i < 2} />
              ))}
            </div>
          </section>
        </div>

        {/* ── ASIDE ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Top Contributors */}
          {topContributors.length > 0 && (
            <div style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #e2e8f0",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
            }}>
              <div style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%)", padding: "16px 18px 13px", borderBottom: "1px solid #fde68a", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#92400e", lineHeight: 1.1 }}>Top Contributors</p>
                  <p style={{ fontSize: 11, color: "#b45309", marginTop: 1 }}>This month's leaders</p>
                </div>
              </div>

              {topContributors.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/contributors/${contributorSlug(c.name, c.id)}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "13px 16px", textDecoration: "none",
                    borderBottom: i < topContributors.length - 1 ? "1px solid #f1f5f9" : "none",
                    background: i === 0 ? "linear-gradient(90deg, rgba(5,150,105,0.04) 0%, transparent 100%)" : "#fff",
                  }}
                >
                  <span style={{ fontSize: i === 0 ? 24 : 18, width: 28, textAlign: "center", flexShrink: 0 }}>{MEDAL[i]}</span>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: i === 0 ? "2.5px solid #059669" : "2px solid #e2e8f0", background: "#d1fae5", position: "relative" }}>
                    {c.avatar_url ? (
                      <Image src={c.avatar_url} alt={c.name} fill sizes="38px" style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#059669" }}>
                        {c.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{c.contributions} approved places</p>
                  </div>
                  <span style={{
                    fontSize: i === 0 ? 11 : 13,
                    fontWeight: 800,
                    color: i === 0 ? "#059669" : "#94a3b8",
                    background: i === 0 ? "#ecfdf5" : "transparent",
                    borderRadius: 999,
                    padding: i === 0 ? "3px 10px" : "0",
                    border: i === 0 ? "1px solid #bbf7d0" : "none",
                    flexShrink: 0,
                  }}>
                    #{i + 1}
                  </span>
                </Link>
              ))}

              <Link href="/leaderboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#059669", textDecoration: "none", background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
                Full leaderboard <ChevronRightIcon className="size-4" />
              </Link>
            </div>
          )}

          {/* CTA — Add a place */}
          <div style={{
            background: "linear-gradient(135deg, #064e35 0%, #059669 100%)",
            borderRadius: 20,
            padding: "26px 22px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -24, right: -24, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -16, left: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <span style={{ fontSize: 30 }}>🗺️</span>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 10, marginBottom: 6, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                Know a hidden gem?
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 18, lineHeight: 1.6 }}>
                Add a place and earn contributor badges.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/add" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#fff", color: "#059669", borderRadius: 12, padding: "11px 20px", fontSize: 14, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
                  + Add a Place
                </Link>
                <Link href="/leaderboard" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(255,255,255,0.14)", color: "#fff", borderRadius: 12, padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.22)" }}>
                  View Leaderboard
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div style={{
            background: "#fff",
            borderRadius: 18,
            border: "1.5px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
          }}>
            <div style={{ padding: "14px 16px 6px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 10 }}>
                Quick Links
              </p>
              {[
                { href: "/explore",    icon: "🗺️", label: "Explore by Province"  },
                { href: "/districts",  icon: "📍", label: "All 77 Districts"      },
                { href: "/allplaces",  icon: "🔍", label: "Browse All Places"     },
                { href: "/leaderboard",icon: "🏆", label: "Leaderboard"           },
                { href: "/about",      icon: "ℹ️", label: "About visitNepal77"    },
              ].map(({ href, icon, label }, i, arr) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 4px",
                    borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#334155",
                    transition: "color 0.15s",
                  }}
                >
                  <span style={{ fontSize: 15 }}>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
            <div style={{ height: 8 }} />
          </div>

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
  allDistricts = [],
  popularDistricts = [],
  topPlaces,
  topContributors = [],
  initialQuery = "",
}) {
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
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setSlides(pool.slice(0, 12));
  }, [allDistricts, featuredDistricts]);

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
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginTop: 2, letterSpacing: "0.04em" }}>{label}</span>
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
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: 999, padding: "4px 10px", border: "1px solid #bbf7d0", flexShrink: 0 }}>#1</span>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#94a3b8", flexShrink: 0 }}>#{idx + 1}</span>
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
