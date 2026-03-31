"use client";

import { useDeferredValue, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import DistrictCard from "@/components/cards/district-card";
import { SearchIcon, ChevronRightIcon, XIcon } from "@/components/ui/icons";

const PROVINCE_EMOJIS = {
  "Koshi":    "🏔️",
  "Madhesh":  "🌾",
  "Bagmati":  "🏛️",
  "Gandaki":  "⛰️",
  "Lumbini":  "🕊️",
  "Karnali":  "🌿",
  "Sudurpashchim": "🌄",
};

const INITIAL_DISTRICT_COUNT = 4;

export default function ExplorePageClient({
  districts,
  provinces,
  districtsByProvince,
  initialQuery = "",
}) {
  const [query, setQuery] = useState(initialQuery);
  const [activeProvince, setActiveProvince] = useState("All");
  const [expandedProvinces, setExpandedProvinces] = useState({});
  const deferredQuery = useDeferredValue(query);
  const search = deferredQuery.trim().toLowerCase();
  const allProvinces = ["All", ...provinces];

  const filteredDistricts = districts.filter((d) => {
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search) ||
      (d.tagline || "").toLowerCase().includes(search);
    const matchProvince = activeProvince === "All" || d.province === activeProvince;
    return matchSearch && matchProvince;
  });

  const totalDistricts = districts.length;

  return (
    <AppShell>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #064e35 0%, #0a6644 50%, #059669 100%)",
        margin: "-24px -1px 0",
        padding: "28px 20px 32px",
        borderRadius: "0 0 32px 32px",
        position: "relative",
        overflow: "hidden",
      }} className="fade-up">
        <div style={{ position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Nepal</p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 6, letterSpacing: "-0.02em" }}>
            Explore All<br /><span style={{ color: "#86efac" }}>77 Districts</span>
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 20, maxWidth: 300 }}>
            Seven provinces. 77 districts. Endless stories.
          </p>

          {/* Search bar */}
          <div style={{ position: "relative", width: "100%" }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1,
            }}>
              <SearchIcon style={{ width: 16, height: 16, color: "#94a3b8" }} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search districts..."
              style={{
                width: "100%",
                padding: "13px 40px 13px 42px",
                borderRadius: 14,
                border: "none",
                background: "rgba(255,255,255,0.95)",
                fontSize: 14,
                color: "#0f172a",
                outline: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                boxSizing: "border-box",
                display: "block",
              }}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "#e2e8f0", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, zIndex: 1 }}
              >
                <XIcon style={{ width: 12, height: 12, color: "#64748b" }} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── STATS ROW ──────────────────────────────────────── */}
      <div className="fade-up-1" style={{ display: "flex", gap: 10, padding: "16px 20px 0" }}>
        {[
          { value: "7", label: "Provinces" },
          { value: String(totalDistricts), label: "Districts" },
          { value: "500+", label: "Places" },
        ].map(({ value, label }) => (
          <div key={label} style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "12px 8px", textAlign: "center", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#059669", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── PROVINCE FILTER PILLS ──────────────────────────── */}
      <div className="fade-up-1 scrollbar-hide" style={{ display: "flex", gap: 8, padding: "14px 20px 0", overflowX: "auto" }}>
        {allProvinces.map((province) => {
          const active = activeProvince === province;
          const emoji = province === "All" ? "🗺️" : (PROVINCE_EMOJIS[province] || "📍");
          return (
            <button
              key={province}
              type="button"
              onClick={() => setActiveProvince(province)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                borderRadius: 999,
                padding: "8px 14px",
                border: active ? "none" : "1.5px solid #e2e8f0",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: "nowrap",
                flexShrink: 0,
                background: active ? "#059669" : "#fff",
                color: active ? "#fff" : "#475569",
                boxShadow: active ? "0 4px 14px rgba(5,150,105,0.3)" : "0 1px 4px rgba(15,23,42,0.06)",
                transition: "all 0.15s ease",
              }}
            >
              <span>{emoji}</span>
              {province}
            </button>
          );
        })}
      </div>

      {/* ── CONTENT ────────────────────────────────────────── */}
      <div style={{ padding: "20px 20px 16px" }}>

        {/* Search results or single province view */}
        {search || activeProvince !== "All" ? (
          <div className="fade-up-2">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: "#64748b" }}>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{filteredDistricts.length}</span>
                {search ? ` result${filteredDistricts.length !== 1 ? "s" : ""} for "${deferredQuery.trim()}"` : ` district${filteredDistricts.length !== 1 ? "s" : ""} in ${activeProvince}`}
              </p>
              {(search || activeProvince !== "All") && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setActiveProvince("All"); }}
                  style={{ fontSize: 12, fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: 999, padding: "5px 12px", border: "none", cursor: "pointer" }}
                >
                  Clear
                </button>
              )}
            </div>
            {filteredDistricts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", background: "#fff", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
                <p style={{ fontSize: 32, marginBottom: 10 }}>🔍</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>No districts found</p>
                <p style={{ fontSize: 13, color: "#94a3b8" }}>Try a different name or province</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filteredDistricts.map((d) => <DistrictCard key={d.id} district={d} />)}
              </div>
            )}
          </div>
        ) : (
          /* All provinces grouped view */
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }} className="fade-up-2">
            {provinces.map((province) => {
              const provinceDistricts = (districtsByProvince?.[province] || []);
              if (!provinceDistricts.length) return null;

              const isExpanded = Boolean(expandedProvinces[province]);
              const visibleDistricts = isExpanded
                ? provinceDistricts
                : provinceDistricts.slice(0, INITIAL_DISTRICT_COUNT);
              const canExpand = provinceDistricts.length > INITIAL_DISTRICT_COUNT;
              const emoji = PROVINCE_EMOJIS[province] || "📍";

              return (
                <section key={province}>
                  {/* Province header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {emoji}
                      </div>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 1 }}>Province</p>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, letterSpacing: "-0.01em" }}>{province}</h2>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveProvince(province)}
                      style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: 999, padding: "6px 12px", border: "none", cursor: "pointer" }}
                    >
                      All {provinceDistricts.length} <ChevronRightIcon className="size-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {visibleDistricts.map((d) => <DistrictCard key={d.id} district={d} />)}
                  </div>

                  {canExpand ? (
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={() => setExpandedProvinces((prev) => ({ ...prev, [province]: !prev[province] }))}
                        style={{
                          border: "1.5px solid #e2e8f0",
                          background: "#fff",
                          color: "#059669",
                          borderRadius: 999,
                          padding: "9px 20px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                        }}
                      >
                        {isExpanded ? "Show less" : `Show all ${provinceDistricts.length} districts`}
                      </button>
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
