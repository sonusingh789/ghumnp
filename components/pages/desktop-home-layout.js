"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import DistrictCard from "@/components/cards/district-card";
import PlaceCard from "@/components/cards/place-card";
import HomeSearch from "@/components/forms/home-search";
import { ChevronRightIcon } from "@/components/ui/icons";
import { contributorSlug } from "@/lib/utils";

const MEDAL = ["🥇", "🥈", "🥉"];

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

export default function DesktopHomeLayout({ featuredDistricts, popularDistricts, topPlaces, topContributors, initialQuery, slides }) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let t;
    function start() {
      t = setInterval(() => setSlide(s => (s + 1) % slides.length), 4000);
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
    <div style={{ paddingBottom: 60 }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        height: 480,
        borderRadius: "0 0 32px 32px",
        overflow: "hidden",
        marginBottom: 40,
      }}>
        {slides.length > 0 && (
          <div
            key={slide}
            style={{ position: "absolute", inset: 0, zIndex: 0, animation: "heroFadeIn 1.2s ease forwards" }}
          >
            <Image
              src={slides[slide].src}
              alt={slides[slide].label}
              fill
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
              priority={slide === 0}
              fetchPriority={slide === 0 ? "high" : "low"}
            />
          </div>
        )}

        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(105deg, rgba(4,40,24,0.88) 0%, rgba(4,40,24,0.65) 45%, rgba(4,40,24,0.2) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to top, rgba(4,40,24,0.6) 0%, transparent 50%)" }} />

        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, zIndex: 2, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 52px", width: 620 }}>
          <div style={{ marginBottom: 18 }}>
            <h1 style={{ fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1.0, letterSpacing: "-0.03em", textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}>
              Discover Nepal&apos;s<br />
              <span style={{ color: "#86efac" }}>77 Districts</span>
            </h1>
          </div>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 28, lineHeight: 1.65, maxWidth: 420 }}>
            Real places, local guides &amp; hidden gems — across every corner of Nepal.
          </p>

          <div style={{ width: "100%", maxWidth: 500, background: "#fff", borderRadius: 18, boxShadow: "0 10px 44px rgba(0,0,0,0.28)", overflow: "hidden" }}>
            <HomeSearch initialQuery={initialQuery} />
          </div>

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

        {current?.label && (
          <div style={{ position: "absolute", bottom: 22, right: 28, zIndex: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.92)", background: "rgba(0,0,0,0.42)", borderRadius: 999, padding: "5px 14px", backdropFilter: "blur(8px)", letterSpacing: "0.02em" }}>
              📍 {current.label}
            </span>
          </div>
        )}
      </div>

      {/* ── FEATURE SHORTCUTS ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, padding: "0 2px", marginBottom: 44 }}>
        {[
          {
            href: "/trekking",
            iconBg: "#e6f4ec",
            icon: (
              <svg viewBox="0 0 36 36" fill="none" style={{ width: 32, height: 32 }}>
                <path d="M18 6C18 6 9 15.8 9 22a9 9 0 0 0 18 0C27 15.8 18 6 18 6Z" stroke="#16a34a" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M13 22c0-3.5 3-8 5-11 2 3 5 7.5 5 11a5 5 0 0 1-10 0Z" fill="#4ade80" opacity=".35"/>
                <circle cx="22" cy="10" r="2" fill="#f97316"/>
                <path d="M22 10 l0 -3" stroke="#f97316" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ),
            title: "Trekking",
            sub: "Explore Trails",
          },
          {
            href: "/ai-trip-planner",
            iconBg: "#ede9fe",
            icon: (
              <svg viewBox="0 0 36 36" fill="none" style={{ width: 32, height: 32 }}>
                <rect x="8" y="10" width="20" height="16" rx="5" fill="#a78bfa" opacity=".25"/>
                <rect x="8" y="10" width="20" height="16" rx="5" stroke="#7c3aed" strokeWidth="1.6"/>
                <circle cx="14" cy="18" r="2" fill="#7c3aed"/>
                <circle cx="22" cy="18" r="2" fill="#7c3aed"/>
                <path d="M15 23c.8.8 5.2.8 6 0" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M14 10 l-2-3M22 10 l2-3" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="12" cy="7" r="1.2" fill="#7c3aed"/>
                <circle cx="24" cy="7" r="1.2" fill="#7c3aed"/>
              </svg>
            ),
            title: "AI Trip Planner",
            sub: "Plan Smart Trips",
          },
          {
            href: "/blog",
            iconBg: "#fff7ed",
            icon: (
              <svg viewBox="0 0 36 36" fill="none" style={{ width: 32, height: 32 }}>
                <rect x="9" y="7" width="18" height="22" rx="3" fill="#fed7aa" opacity=".5"/>
                <rect x="9" y="7" width="18" height="22" rx="3" stroke="#ea580c" strokeWidth="1.6"/>
                <path d="M13 13h10M13 17h10M13 21h6" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="14" y="5" width="2.5" height="4" rx="1" fill="#ea580c"/>
                <rect x="19.5" y="5" width="2.5" height="4" rx="1" fill="#ea580c"/>
              </svg>
            ),
            title: "Blog",
            sub: "Travel Stories",
          },
          {
            href: "/calendar",
            iconBg: "#eff6ff",
            icon: (
              <svg viewBox="0 0 36 36" fill="none" style={{ width: 32, height: 32 }}>
                <rect x="8" y="11" width="20" height="17" rx="3" fill="#bfdbfe" opacity=".5"/>
                <rect x="8" y="11" width="20" height="17" rx="3" stroke="#2563eb" strokeWidth="1.6"/>
                <path d="M8 16h20" stroke="#2563eb" strokeWidth="1.4"/>
                <rect x="13" y="5" width="2.5" height="5" rx="1" fill="#2563eb"/>
                <rect x="20.5" y="5" width="2.5" height="5" rx="1" fill="#2563eb"/>
                <rect x="12" y="20" width="4" height="4" rx="1" fill="#2563eb" opacity=".6"/>
                <rect x="20" y="20" width="4" height="4" rx="1" fill="#2563eb" opacity=".6"/>
              </svg>
            ),
            title: "Calendar",
            sub: "Upcoming Events",
          },
        ].map(({ href, iconBg, icon, title, sub }) => (
          <Link
            key={title}
            href={href}
            style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 18, padding: "18px 20px", boxShadow: "0 2px 14px rgba(15,23,42,0.05)", textDecoration: "none" }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>{title}</p>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3, fontWeight: 500 }}>{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── FEATURED DISTRICTS ────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <SectionHeader eyebrow="Explore" title="Featured Districts" link="/districts" linkLabel="All 77" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {featuredDistricts.slice(0, 6).map((d, i) => (
            <DistrictCard key={d.id} district={d} imagePriority={i < 3} />
          ))}
        </div>
      </section>

      {/* ── TWO-COLUMN LAYOUT ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 30, alignItems: "start" }}>

        <div>
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

          <section>
            <SectionHeader eyebrow="Must Visit" title="Top Places" link="/allplaces" linkLabel="View all" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {topPlaces.slice(0, 8).map((p, i) => (
                <PlaceCard key={p.id} place={p} layout="grid" imagePriority={i < 2} />
              ))}
            </div>
          </section>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {topContributors.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 20px rgba(15,23,42,0.06)" }}>
              <div style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%)", padding: "16px 18px 13px", borderBottom: "1px solid #fde68a", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#92400e", lineHeight: 1.1 }}>Top Contributors</p>
                  <p style={{ fontSize: 11, color: "#b45309", marginTop: 1 }}>This month&apos;s leaders</p>
                </div>
              </div>
              {topContributors.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/contributors/${contributorSlug(c.name, c.id)}`}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", textDecoration: "none", borderBottom: i < topContributors.length - 1 ? "1px solid #f1f5f9" : "none", background: i === 0 ? "linear-gradient(90deg, rgba(5,150,105,0.04) 0%, transparent 100%)" : "#fff" }}
                >
                  <span style={{ fontSize: i === 0 ? 24 : 18, width: 28, textAlign: "center", flexShrink: 0 }}>{MEDAL[i]}</span>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: i === 0 ? "2.5px solid #059669" : "2px solid #e2e8f0", background: "#d1fae5" }}>
                    {c.avatar_url ? (
                      <Image src={c.avatar_url} alt={c.name} width={38} height={38} style={{ width: 38, height: 38, objectFit: "cover", display: "block" }} />
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
                  <span style={{ fontSize: i === 0 ? 11 : 13, fontWeight: 800, color: i === 0 ? "#059669" : "#6b7280", background: i === 0 ? "#ecfdf5" : "transparent", borderRadius: 999, padding: i === 0 ? "3px 10px" : "0", border: i === 0 ? "1px solid #bbf7d0" : "none", flexShrink: 0 }}>
                    #{i + 1}
                  </span>
                </Link>
              ))}
              <Link href="/leaderboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#059669", textDecoration: "none", background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
                Full leaderboard <ChevronRightIcon className="size-4" />
              </Link>
            </div>
          )}

          <div style={{ background: "linear-gradient(135deg, #064e35 0%, #059669 100%)", borderRadius: 20, padding: "26px 22px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -24, right: -24, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -16, left: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <span style={{ fontSize: 30 }}>🗺️</span>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 10, marginBottom: 6, lineHeight: 1.2, letterSpacing: "-0.02em" }}>Know a hidden gem?</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 18, lineHeight: 1.6 }}>Add a place and earn contributor badges.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/add" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#fff", color: "#059669", borderRadius: 12, padding: "11px 20px", fontSize: 14, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>+ Add a Place</Link>
                <Link href="/leaderboard" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(255,255,255,0.14)", color: "#fff", borderRadius: 12, padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.22)" }}>View Leaderboard</Link>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 12px rgba(15,23,42,0.04)" }}>
            <div style={{ padding: "14px 16px 6px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7280", marginBottom: 10 }}>Quick Links</p>
              {[
                { href: "/explore",     icon: "🗺️", label: "Explore by Province"  },
                { href: "/districts",   icon: "📍", label: "All 77 Districts"      },
                { href: "/allplaces",   icon: "🔍", label: "Browse All Places"     },
                { href: "/leaderboard", icon: "🏆", label: "Leaderboard"           },
                { href: "/about",       icon: "ℹ️", label: "About visitNepal77"    },
              ].map(({ href, icon, label }, i, arr) => (
                <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none", textDecoration: "none", fontSize: 13, fontWeight: 600, color: "#334155" }}>
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
