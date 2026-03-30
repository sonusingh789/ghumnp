"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import DistrictCard from "@/components/cards/district-card";

const detailedMap = (districts) => new Map(districts.map((district) => [district.name.toLowerCase(), district]));

export default function DistrictsPageClient({ allDistricts, districts }) {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const filtered = allDistricts.filter((name) => name.toLowerCase().includes(search.toLowerCase()));
  const districtMap = detailedMap(districts);

  return (
    <AppShell>
      <div style={{ padding: "24px 20px 0" }} className="fade-up">
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 4 }}>
          District Directory
        </div>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginBottom: 4 }}>
          All 77 Districts of Nepal
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.65, marginBottom: 16 }}>
          Explore every district of Nepal — from the high Himalayan peaks of Solukhumbu and Mustang to the rich cultural heartland of Kathmandu Valley and the wildlife havens of the Terai plains. Find the best places to visit, local food spots, and hidden gems in each district on visitNepal77.
        </p>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ position: "relative", flex: 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--ink-faint)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search districts..."
              style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-strong)", background: "var(--bg-card)", fontSize: 14, color: "var(--ink)", outline: "none" }}
            />
          </label>
          <div style={{ display: "flex", background: "var(--bg-card)", border: "1.5px solid var(--border-strong)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {["grid", "list"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                style={{
                  width: 44, height: 44, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  background: view === value ? "var(--jade)" : "transparent",
                  color: view === value ? "#fff" : "var(--ink-faint)",
                }}
                aria-label={`${value} view`}
              >
                {value === "grid" ? "▦" : "☰"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 10, marginBottom: 20 }}>
          Showing {filtered.length} districts
        </div>
      </div>

      <div style={{ padding: "0 20px 16px" }} className="fade-up-1">
        {view === "grid" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((name) => {
              const detailed = districtMap.get(name.toLowerCase());
              if (detailed) return <DistrictCard key={name} district={detailed} />;

              return (
                <div key={name} style={{ borderRadius: "var(--radius-lg)", border: "1.5px dashed var(--border-strong)", background: "var(--bg-card)", padding: "16px", minHeight: 140, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <span style={{ background: "var(--bg)", color: "var(--ink-faint)", borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", alignSelf: "flex-start" }}>
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
              const detailed = districtMap.get(name.toLowerCase());

              return (
                <div key={name} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-sm)" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{name}</div>
                    {detailed ? (
                      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
                        {detailed.province} · ★ {detailed.rating.toFixed(1)}
                      </div>
                    ) : null}
                  </div>
                  {detailed ? (
                    <a href={`/districts/${detailed.id}`} style={{ background: "var(--jade-soft)", color: "var(--jade)", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                      View
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
