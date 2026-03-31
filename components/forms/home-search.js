"use client";

import Link from "next/link";
import { useEffect, useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPinIcon, SearchIcon, XIcon } from "@/components/ui/icons";

const FEATURED_SEARCH_LINKS = [
  { href: "/explore", label: "🗺️ Browse all districts", sub: "Explore all 77" },
  { href: "/districts", label: "📍 See all 77 districts", sub: "Map & list view" },
  { href: "/favorites", label: "❤️ Saved routes", sub: "Your collection" },
];

export default function HomeSearch({ initialQuery = "" }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(Boolean(initialQuery));
  const [results, setResults] = useState({ districts: [], places: [] });
  const [status, setStatus] = useState(initialQuery.trim().length >= 2 ? "loading" : "idle");
  const deferredQuery = useDeferredValue(query);
  const trimmedQuery = deferredQuery.trim();

  const totalResults = useMemo(
    () => results.districts.length + results.places.length,
    [results.districts.length, results.places.length]
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (!trimmedQuery) { setResults({ districts: [], places: [] }); setStatus("idle"); return undefined; }
    if (trimmedQuery.length < 2) { setResults({ districts: [], places: [] }); setStatus("typing"); return undefined; }
    const controller = new AbortController();
    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, { signal: controller.signal, cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResults({ districts: Array.isArray(data?.districts) ? data.districts : [], places: Array.isArray(data?.places) ? data.places : [] });
        setStatus("done");
      } catch (e) {
        if (e?.name === "AbortError") return;
        setResults({ districts: [], places: [] });
        setStatus("error");
      }
    }
    load();
    return () => controller.abort();
  }, [trimmedQuery]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  function handleResultNavigation(href) { setIsOpen(false); router.push(href); }

  return (
    <>
      {/* Trigger bar */}
      <form onSubmit={(e) => { e.preventDefault(); if (trimmedQuery.length >= 2) setIsOpen(true); }} style={{ position: "relative", display: "block" }}>
        <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#059669", display: "flex", pointerEvents: "none" }}>
          <SearchIcon style={{ width: 18, height: 18 }} />
        </span>
        <input
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          placeholder="Search districts, places, foods..."
          aria-label="Search Nepal districts and places"
          style={{
            width: "100%",
            padding: "15px 16px 15px 46px",
            border: "none",
            background: "#fff",
            fontSize: 14,
            color: "#0f172a",
            outline: "none",
            borderRadius: 20,
          }}
        />
      </form>

      {/* Full-screen overlay */}
      {isOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "linear-gradient(160deg, rgba(4,40,24,0.92) 0%, rgba(5,90,55,0.88) 100%)",
            backdropFilter: "blur(20px)",
            display: "flex", flexDirection: "column",
            padding: "0",
          }}
        >
          {/* Header */}
          <div style={{
            background: "rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            padding: "12px 16px",
          }}>
            {/* Close row */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close search"
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <XIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Search input */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#86efac", display: "flex", pointerEvents: "none" }}>
                <SearchIcon style={{ width: 18, height: 18 }} />
              </span>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search all districts, places, foods..."
                aria-label="Search all districts and places"
                style={{
                  width: "100%",
                  padding: "13px 16px 13px 44px",
                  borderRadius: 14,
                  border: "1.5px solid rgba(134,239,172,0.35)",
                  background: "rgba(255,255,255,0.1)",
                  fontSize: 15, fontWeight: 500,
                  color: "#fff",
                  outline: "none",
                  caretColor: "#86efac",
                }}
              />
            </div>
            <p style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.01em" }}>
              Search across all 77 districts · places · food · hidden gems
            </p>
          </div>

          {/* Results area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

            {/* Empty state — quick links */}
            {!trimmedQuery ? (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(134,239,172,0.7)", marginBottom: 10 }}>
                  Quick links
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {FEATURED_SEARCH_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 14, padding: "13px 16px",
                        textDecoration: "none",
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{item.label}</span>
                      <span style={{ fontSize: 11, color: "rgba(134,239,172,0.8)", fontWeight: 600 }}>{item.sub}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : trimmedQuery.length < 2 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                Type at least 2 letters to search…
              </div>
            ) : status === "loading" ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ width: 28, height: 28, border: "3px solid rgba(134,239,172,0.3)", borderTopColor: "#86efac", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Searching Nepal…</p>
              </div>
            ) : status === "error" ? (
              <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: "14px 16px", color: "#fca5a5", fontSize: 13 }}>
                Search unavailable right now. Please try again.
              </div>
            ) : totalResults === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                No results for <strong style={{ color: "#86efac" }}>{trimmedQuery}</strong>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                  {totalResults} results for <span style={{ color: "#86efac" }}>{trimmedQuery}</span>
                </div>

                {/* Places */}
                {results.places.length > 0 && (
                  <section>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(134,239,172,0.7)", marginBottom: 8 }}>Places</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {results.places.map((place) => (
                        <button
                          key={`place-${place.id}`}
                          type="button"
                          onClick={() => handleResultNavigation(`/place/${place.id}`)}
                          style={{
                            width: "100%", textAlign: "left",
                            background: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 14, padding: "13px 14px",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{place.name}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                                <MapPinIcon style={{ width: 12, height: 12 }} />
                                {place.location || place.districtName}
                              </div>
                              {place.description && (
                                <p style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                  {place.description}
                                </p>
                              )}
                            </div>
                            <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(134,239,172,0.15)", color: "#86efac", border: "1px solid rgba(134,239,172,0.25)", borderRadius: 999, padding: "3px 9px" }}>
                              {place.category || "place"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Districts */}
                {results.districts.length > 0 && (
                  <section>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(134,239,172,0.7)", marginBottom: 8 }}>Districts</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {results.districts.map((district) => (
                        <button
                          key={`district-${district.id}`}
                          type="button"
                          onClick={() => handleResultNavigation(`/districts/${district.id}`)}
                          style={{
                            width: "100%", textAlign: "left",
                            background: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 14, padding: "13px 14px",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{district.name}</div>
                              <div style={{ fontSize: 12, color: "rgba(134,239,172,0.7)" }}>{district.province}</div>
                              {district.tagline && (
                                <p style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                  {district.tagline}
                                </p>
                              )}
                            </div>
                            <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 999, padding: "3px 9px" }}>
                              District
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
