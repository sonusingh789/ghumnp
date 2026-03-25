"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import DistrictCard from "@/components/cards/district-card";

export default function ExplorePageClient({ districts, provinces }) {
  const [query, setQuery] = useState("");
  const [activeProvince, setActiveProvince] = useState("All");
  const deferredQuery = useDeferredValue(query);
  const search = deferredQuery.trim().toLowerCase();
  const allProvinces = ["All", ...provinces];

  const filteredDistricts = districts.filter((district) => {
    const matchSearch =
      !search ||
      district.name.toLowerCase().includes(search) ||
      district.tagline.toLowerCase().includes(search);
    const matchProvince = activeProvince === "All" || district.province === activeProvince;
    return matchSearch && matchProvince;
  });

  return (
    <AppShell>
      <div style={{ padding: "24px 20px 0" }} className="fade-up">
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 4 }}>Explore</div>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginBottom: 8 }}>
          Browse by Province
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 16 }}>
          Seven provinces, 77 districts, endless stories waiting to be discovered.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <label style={{ position: "relative", flex: 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--ink-faint)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search districts..." style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-strong)", background: "var(--bg-card)", fontSize: 14, color: "var(--ink)", outline: "none" }} />
          </label>
          <Link href="/districts" style={{ background: "var(--jade)", color: "#fff", borderRadius: "var(--radius-md)", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 4px 16px var(--jade-glow)" }}>
            All 77
          </Link>
        </div>
      </div>

      <div className="fade-up-1 scrollbar-hide mobile-h-scroll" style={{ display: "flex", gap: 8, padding: "16px 20px 0" }}>
        {allProvinces.map((province) => (
          <button key={province} type="button" onClick={() => setActiveProvince(province)} style={{
            borderRadius: 999, padding: "7px 16px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.2s ease",
            background: activeProvince === province ? "var(--jade)" : "var(--bg-card)",
            color: activeProvince === province ? "#fff" : "var(--ink-muted)",
            boxShadow: activeProvince === province ? "0 4px 16px var(--jade-glow)" : "var(--shadow-sm)",
          }}>
            {province}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 20px 16px" }}>
        {activeProvince === "All" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }} className="fade-up-2">
            {provinces.map((province) => {
              const provinceDistricts = districts.filter((district) => {
                const matchSearch =
                  !search ||
                  district.name.toLowerCase().includes(search) ||
                  district.tagline.toLowerCase().includes(search);
                return district.province === province && matchSearch;
              });

              if (!provinceDistricts.length) return null;

              return (
                <section key={province}>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 2 }}>Province</div>
                      <h2 className="display" style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>{province}</h2>
                    </div>
                    <Link href="/districts" style={{ fontSize: 12, fontWeight: 700, color: "var(--jade)", display: "flex", alignItems: "center" }}>
                      View all
                    </Link>
                  </div>
                  <div className="scrollbar-hide mobile-h-scroll" style={{ display: "flex", gap: 12, paddingBottom: 4 }}>
                    {provinceDistricts.map((district) => <DistrictCard key={district.id} district={district} compact />)}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="fade-up-2">
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 16 }}>
              {filteredDistricts.length} districts in {activeProvince}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredDistricts.map((district) => <DistrictCard key={district.id} district={district} />)}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
