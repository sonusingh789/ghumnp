"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import DistrictCard from "@/components/cards/district-card";
import { allDistricts, districts } from "@/data/nepal";

const detailedMap = new Map(districts.map((d) => [d.name.toLowerCase(), d]));

export default function DistrictsPage() {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const filtered = allDistricts.filter((n) => n.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell>
      {/* Header */}
      <div style={{ padding: "24px 20px 0" }} className="fade-up">
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 4 }}>
          District Directory
        </div>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginBottom: 4 }}>
          All 77 Districts
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 16 }}>
          Every district of Nepal, from the Himalayan peaks to the Terai plains.
        </p>

        {/* Search + Toggle */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ position: "relative", flex: 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--ink-faint)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search districts..."
              style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-strong)", background: "var(--bg-card)", fontSize: 14, color: "var(--ink)", outline: "none" }}
            />
          </label>
          <div style={{ display: "flex", background: "var(--bg-card)", border: "1.5px solid var(--border-strong)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {["grid", "list"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                style={{
                  width: 44, height: 44, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  background: view === v ? "var(--jade)" : "transparent",
                  color: view === v ? "#fff" : "var(--ink-faint)",
                  transition: "all 0.2s ease",
                }}
                aria-label={`${v} view`}
              >
                {v === "grid" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
                    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 10, marginBottom: 20 }}>
          Showing {filtered.length} districts
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "0 20px 16px" }} className="fade-up-1">
        {view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {filtered.map((name) => {
              const detailed = detailedMap.get(name.toLowerCase());
              if (detailed) return <DistrictCard key={name} district={detailed} />;
              return (
                <div key={name} style={{
                  borderRadius: "var(--radius-lg)",
                  border: "1.5px dashed var(--border-strong)",
                  background: "var(--bg-card)",
                  padding: "16px",
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}>
                  <span style={{ background: "var(--bg)", color: "var(--ink-faint)", borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", alignSelf: "flex-start" }}>
                    Coming Soon
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 4 }}>{name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-faint)", lineHeight: 1.5 }}>Content coming in a future release.</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((name) => {
              const detailed = detailedMap.get(name.toLowerCase());
              return (
                <div key={name} style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "var(--shadow-sm)",
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{name}</div>
                    {detailed && (
                      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
                        {detailed.province} · ★ {detailed.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  {detailed ? (
                    <a href={`/districts/${detailed.id}`} style={{ background: "var(--jade-soft)", color: "var(--jade)", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                      View →
                    </a>
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600 }}>Coming soon</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
