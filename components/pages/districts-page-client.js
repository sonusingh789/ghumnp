"use client";

import { useDeferredValue, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import DistrictCard from "@/components/cards/district-card";
import { SearchIcon, XIcon } from "@/components/ui/icons";

const detailedMap = (districts) =>
  new Map(districts.map((district) => [district.name.toLowerCase(), district]));

const VIEW_ICONS = {
  grid: (
    <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 14, height: 14 }}>
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 14, height: 14 }}>
      <rect x="1" y="2" width="14" height="2.5" rx="1.25" />
      <rect x="1" y="6.75" width="14" height="2.5" rx="1.25" />
      <rect x="1" y="11.5" width="14" height="2.5" rx="1.25" />
    </svg>
  ),
};

function SearchInput({ value, onChange, placeholder, style = {} }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1 }}>
        <SearchIcon style={{ width: 15, height: 15, color: "#6b7280" }} />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder || "Search districts"}
        style={{
          width: "100%", padding: "11px 36px 11px 40px",
          borderRadius: 13, border: "1.5px solid #e2e8f0",
          background: "#fff", fontSize: 14, color: "#0f172a",
          outline: "none", boxSizing: "border-box",
          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        }}
      />
      {value ? (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search"
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "#e2e8f0", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
          <XIcon style={{ width: 11, height: 11, color: "#64748b" }} />
        </button>
      ) : null}
    </div>
  );
}

export default function DistrictsPageClient({ allDistricts, districts }) {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const q = deferredSearch.trim().toLowerCase();
  const filtered = allDistricts.filter((name) => name.toLowerCase().includes(q));
  const districtMap = detailedMap(districts);

  function EmptyState() {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>No districts found</p>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Try a different name</p>
      </div>
    );
  }

  return (
    <AppShell>

      {/* ════════════════════════════════════════════════════════
          DESKTOP LAYOUT
      ════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block">
        {/* Header */}
        <div style={{
          background: "linear-gradient(105deg, #064e35 0%, #0a6644 45%, #059669 100%)",
          borderRadius: 24, padding: "36px 40px 36px",
          position: "relative", overflow: "hidden", marginBottom: 28,
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>Nepal</p>
              <h1 style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.025em", marginBottom: 8 }}>
                All <span style={{ color: "#86efac" }}>77 Districts</span>
              </h1>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.6, maxWidth: 380 }}>
                From Himalayan peaks to Terai plains — every district, one guide.
              </p>
            </div>
            {/* Inline search */}
            <div style={{ width: 340, flexShrink: 0 }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", display: "flex", pointerEvents: "none", zIndex: 1 }}>
                  <SearchIcon style={{ width: 16, height: 16, color: "#6b7280" }} />
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search districts..."
                  aria-label="Search districts"
                  style={{
                    width: "100%", padding: "14px 40px 14px 44px",
                    borderRadius: 16, border: "none",
                    background: "rgba(255,255,255,0.95)",
                    fontSize: 14, color: "#0f172a", outline: "none",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.2)", boxSizing: "border-box",
                  }}
                />
                {search ? (
                  <button type="button" onClick={() => setSearch("")} aria-label="Clear search"
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "#e2e8f0", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
                    <XIcon style={{ width: 12, height: 12, color: "#64748b" }} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>{filtered.length}</span>
            {q ? ` result${filtered.length !== 1 ? "s" : ""} for "${deferredSearch.trim()}"` : " districts"}
          </p>
          <div style={{ display: "flex", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
            {["grid", "list"].map((v) => (
              <button key={v} type="button" onClick={() => setView(v)} aria-label={`${v} view`}
                style={{ width: 40, height: 36, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: view === v ? "#059669" : "transparent", color: view === v ? "#fff" : "#6b7280", transition: "all 0.15s ease" }}>
                {VIEW_ICONS[v]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? <EmptyState /> : view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
            {filtered.map((name) => {
              const detailed = districtMap.get(name.toLowerCase());
              if (detailed) return <DistrictCard key={name} district={detailed} />;
              return (
                <div key={name} style={{ borderRadius: 20, border: "1.5px dashed #e2e8f0", background: "#fff", padding: "16px", minHeight: 110, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <span style={{ background: "#f1f5f9", color: "#6b7280", borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", alignSelf: "flex-start" }}>Coming Soon</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 3 }}>{name}</p>
                    <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>Content coming in a future release.</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((name, i) => {
              const detailed = districtMap.get(name.toLowerCase());
              return (
                <div key={name} style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 10, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#059669", flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", lineHeight: 1.2 }}>{name}</p>
                      {detailed ? <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{detailed.province} · ★ {detailed.rating.toFixed(1)}</p> : null}
                    </div>
                  </div>
                  {detailed ? (
                    <a href={`/districts/${detailed.id}`} style={{ fontSize: 13, fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: 999, padding: "6px 16px", whiteSpace: "nowrap", textDecoration: "none", border: "1px solid #d1fae5", flexShrink: 0 }}>View →</a>
                  ) : (
                    <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>Coming soon</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          MOBILE LAYOUT — untouched
      ════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        <div style={{ background: "linear-gradient(160deg, #064e35 0%, #0a6644 50%, #059669 100%)", margin: "-24px -1px 0", padding: "28px 20px 32px", borderRadius: "0 0 32px 32px", position: "relative", overflow: "hidden" }} className="fade-up">
          <div style={{ position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Nepal</p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 6, letterSpacing: "-0.02em" }}>
              All <span style={{ color: "#86efac" }}>77 Districts</span>
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 20, maxWidth: 300 }}>
              From Himalayan peaks to Terai plains — every district, one guide.
            </p>
            <div style={{ position: "relative", width: "100%" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1 }}>
                <SearchIcon style={{ width: 16, height: 16, color: "#6b7280" }} />
              </span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search districts..."
                aria-label="Search districts"
                style={{ width: "100%", padding: "13px 40px 13px 42px", borderRadius: 14, border: "none", background: "rgba(255,255,255,0.95)", fontSize: 14, color: "#0f172a", outline: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", boxSizing: "border-box" }} />
              {search ? (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search"
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "#e2e8f0", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
                  <XIcon style={{ width: 12, height: 12, color: "#64748b" }} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="fade-up-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 0" }}>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>{filtered.length}</span>
            {q ? ` result${filtered.length !== 1 ? "s" : ""} for "${deferredSearch.trim()}"` : " districts"}
          </p>
          <div style={{ display: "flex", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
            {["grid", "list"].map((v) => (
              <button key={v} type="button" onClick={() => setView(v)} aria-label={`${v} view`}
                style={{ width: 38, height: 34, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: view === v ? "#059669" : "transparent", color: view === v ? "#fff" : "#6b7280", transition: "all 0.15s ease" }}>
                {VIEW_ICONS[v]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "14px 20px 24px" }} className="fade-up-2">
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", background: "#fff", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>🔍</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>No districts found</p>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Try a different name</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filtered.map((name) => {
                const detailed = districtMap.get(name.toLowerCase());
                if (detailed) return <DistrictCard key={name} district={detailed} />;
                return (
                  <div key={name} style={{ borderRadius: 20, border: "1.5px dashed #e2e8f0", background: "#fff", padding: "16px", minHeight: 110, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <span style={{ background: "#f1f5f9", color: "#6b7280", borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", alignSelf: "flex-start" }}>Coming Soon</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 3 }}>{name}</p>
                      <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>Content coming in a future release.</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((name, i) => {
                const detailed = districtMap.get(name.toLowerCase());
                return (
                  <div key={name} style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 16, padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#059669", flexShrink: 0 }}>{i + 1}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", lineHeight: 1.2 }}>{name}</p>
                        {detailed ? <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{detailed.province} · ★ {detailed.rating.toFixed(1)}</p> : null}
                      </div>
                    </div>
                    {detailed ? (
                      <a href={`/districts/${detailed.id}`} style={{ fontSize: 12, fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: 999, padding: "5px 14px", whiteSpace: "nowrap", textDecoration: "none", border: "1px solid #d1fae5", flexShrink: 0 }}>View →</a>
                    ) : (
                      <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>Coming soon</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </AppShell>
  );
}
