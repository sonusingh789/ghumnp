"use client";

import Link from "next/link";
import { useEffect, useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPinIcon, SearchIcon, XIcon } from "@/components/ui/icons";

const FEATURED_SEARCH_LINKS = [
  { href: "/explore", label: "Browse all districts" },
  { href: "/districts", label: "See all 77 districts" },
  { href: "/favorites", label: "Open saved routes" },
];

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--jade)",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!trimmedQuery) {
      setResults({ districts: [], places: [] });
      setStatus("idle");
      return undefined;
    }

    if (trimmedQuery.length < 2) {
      setResults({ districts: [], places: [] });
      setStatus("typing");
      return undefined;
    }

    const controller = new AbortController();

    async function loadResults() {
      setStatus("loading");

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data = await response.json();
        setResults({
          districts: Array.isArray(data?.districts) ? data.districts : [],
          places: Array.isArray(data?.places) ? data.places : [],
        });
        setStatus("done");
      } catch (error) {
        if (error?.name === "AbortError") return;
        setResults({ districts: [], places: [] });
        setStatus("error");
      }
    }

    loadResults();

    return () => controller.abort();
  }, [trimmedQuery]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  function openSearch() {
    setIsOpen(true);
  }

  function closeSearch() {
    setIsOpen(false);
  }

  function submitSearch(event) {
    event.preventDefault();
    if (trimmedQuery.length < 2) return;
    setIsOpen(true);
  }

  function handleResultNavigation(href) {
    setIsOpen(false);
    router.push(href);
  }

  return (
    <>
      <form onSubmit={submitSearch} style={{ position: "relative", display: "block" }}>
        <SearchIcon
          className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[var(--ink-faint)]"
        />
        <input
          value={query}
          onFocus={openSearch}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          placeholder="Search districts, places, foods..."
          aria-label="Search Nepal districts and places"
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
      </form>

      {isOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(15, 23, 42, 0.42)",
            backdropFilter: "blur(14px)",
            padding: "24px 16px",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search across Nepal districts and places"
            style={{
              width: "100%",
              maxWidth: 760,
              margin: "0 auto",
              borderRadius: 28,
              overflow: "hidden",
              background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
              border: "1px solid rgba(255,255,255,0.55)",
              boxShadow: "0 30px 80px rgba(15,23,42,0.22)",
            }}
          >
            <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid rgba(148, 163, 184, 0.18)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ position: "relative", flex: 1 }}>
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[var(--ink-faint)]" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search all districts, places, foods..."
                    aria-label="Search all districts and places"
                    style={{
                      width: "100%",
                      padding: "14px 16px 14px 44px",
                      borderRadius: 18,
                      border: "1.5px solid rgba(15,23,42,0.08)",
                      background: "#fff",
                      fontSize: 15,
                      color: "var(--ink)",
                      outline: "none",
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              <p style={{ marginTop: 10, fontSize: 12, color: "var(--ink-muted)" }}>
                Search across districts, attractions, locations, and food-related places.
              </p>
            </div>

            <div style={{ maxHeight: "min(70vh, 720px)", overflowY: "auto", padding: 18 }}>
              {!trimmedQuery ? (
                <div>
                  <SectionTitle>Quick Links</SectionTitle>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {FEATURED_SEARCH_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSearch}
                        className="rounded-3xl border border-black/5 bg-white px-4 py-4 text-sm font-semibold text-slate-800 shadow-[0_14px_30px_rgba(17,24,39,0.05)] transition hover:-translate-y-0.5"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : trimmedQuery.length < 2 ? (
                <div className="rounded-[24px] border border-dashed border-emerald-200 bg-emerald-50/70 px-5 py-6 text-sm text-emerald-900">
                  Type at least 2 letters to search all districts and places.
                </div>
              ) : status === "loading" ? (
                <div className="rounded-[24px] border border-black/5 bg-white px-5 py-6 text-sm text-slate-600 shadow-[0_14px_30px_rgba(17,24,39,0.05)]">
                  Searching for matches across the site...
                </div>
              ) : status === "error" ? (
                <div className="rounded-[24px] border border-rose-100 bg-rose-50 px-5 py-6 text-sm text-rose-700">
                  Search is unavailable right now. Please try again in a moment.
                </div>
              ) : totalResults === 0 ? (
                <div className="rounded-[24px] border border-black/5 bg-white px-5 py-6 text-sm text-slate-600 shadow-[0_14px_30px_rgba(17,24,39,0.05)]">
                  No matches found for <strong>{trimmedQuery}</strong>.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                    {totalResults} results for <strong>{trimmedQuery}</strong>
                  </div>

                  {results.places.length ? (
                    <section>
                      <SectionTitle>Places</SectionTitle>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {results.places.map((place) => (
                          <button
                            key={`place-${place.id}`}
                            type="button"
                            onClick={() => handleResultNavigation(`/place/${place.id}`)}
                            className="w-full rounded-[24px] border border-black/5 bg-white px-4 py-4 text-left shadow-[0_14px_30px_rgba(17,24,39,0.05)] transition hover:-translate-y-0.5"
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>{place.name}</div>
                                <div className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
                                  <MapPinIcon className="size-4" />
                                  {place.location || place.districtName}
                                </div>
                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                                  {place.description || `${place.category} in ${place.districtName}`}
                                </p>
                              </div>
                              <div className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                                {place.category || "place"}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {results.districts.length ? (
                    <section>
                      <SectionTitle>Districts</SectionTitle>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {results.districts.map((district) => (
                          <button
                            key={`district-${district.id}`}
                            type="button"
                            onClick={() => handleResultNavigation(`/districts/${district.id}`)}
                            className="w-full rounded-[24px] border border-black/5 bg-white px-4 py-4 text-left shadow-[0_14px_30px_rgba(17,24,39,0.05)] transition hover:-translate-y-0.5"
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>{district.name}</div>
                                <div className="mt-1 text-sm text-slate-500">{district.province}</div>
                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{district.tagline}</p>
                              </div>
                              <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                                District
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
