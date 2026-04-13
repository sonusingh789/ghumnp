"use client";

import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/layout/app-shell";

const BADGE_CONFIG = {
  explorer:    { label: "Explorer",    color: "#64748b", bg: "#f1f5f9" },
  contributor: { label: "Contributor", color: "#1d4ed8", bg: "#eff6ff" },
  local_guide: { label: "Local Guide", color: "#059669", bg: "#ecfdf5" },
  champion:    { label: "Champion",    color: "#d97706", bg: "#fffbeb" },
  pioneer:     { label: "Pioneer",     color: "#7c3aed", bg: "#f5f3ff" },
};

const CATEGORY_LABELS = {
  attraction: "Tourist Attraction",
  food:       "Local Food",
  restaurant: "Restaurant",
  hotel:      "Hotel",
  stay:       "Local Stay",
};

function computeAchievements(stats) {
  const achievements = [];
  if (stats.districts_covered >= 5)
    achievements.push({ emoji: "🗺️", name: "Nepal Explorer", desc: `Contributed to ${stats.districts_covered}+ districts` });
  if (stats.places_approved >= 30)
    achievements.push({ emoji: "🏆", name: "Pioneer", desc: "30+ approved places" });
  else if (stats.places_approved >= 15)
    achievements.push({ emoji: "🥇", name: "Champion", desc: "15+ approved places" });
  if (stats.places_approved >= 1)
    achievements.push({ emoji: "✅", name: "Verified Contributor", desc: "First place approved" });
  return achievements;
}

export default function ContributorProfileClient({ contributor }) {
  const badgeCfg = BADGE_CONFIG[contributor.badge] || BADGE_CONFIG.explorer;
  const achievements = computeAchievements(contributor.stats);
  const districts = contributor.districts || [];

  return (
    <AppShell>
      {/* Green header banner */}
      <div style={{ background: "linear-gradient(135deg, #059669 0%, #065f46 100%)", margin: "-24px -1px 0", padding: "20px 20px 60px", borderRadius: "0 0 32px 32px", position: "relative" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 12 }}>
          ← Back
        </Link>
      </div>

      {/* Profile card — overlaps header */}
      <div style={{ margin: "-44px 0 0", background: "#fff", borderRadius: 24, padding: "20px", boxShadow: "0 8px 32px rgba(15,23,42,0.1)", position: "relative", zIndex: 1, border: "1.5px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "#d1fae5", border: "3px solid #fff", boxShadow: "0 4px 14px rgba(5,150,105,0.25)" }}>
              {contributor.avatar ? (
                <Image src={contributor.avatar} alt={contributor.name} width={72} height={72} className="object-cover" style={{ width: "100%", height: "100%" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#059669" }}>
                  {contributor.name[0].toUpperCase()}
                </div>
              )}
            </div>
            {/* Badge dot */}
            <div style={{ position: "absolute", bottom: 0, right: -2, background: "#059669", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", fontSize: 11 }}>
              ✓
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 2 }}>{contributor.name}</h1>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
              Member since {new Date(contributor.joined).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <span style={{ fontSize: 11, fontWeight: 700, color: badgeCfg.color, background: badgeCfg.bg, borderRadius: 999, padding: "3px 10px" }}>
              {badgeCfg.label}
            </span>
          </div>
        </div>

        {contributor.bio ? (
          <p style={{ marginTop: 14, fontSize: 13, color: "#475569", lineHeight: 1.65, borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>{contributor.bio}</p>
        ) : null}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16 }}>
          {[
            { label: "Contributions", value: contributor.stats.places_approved, color: "#059669", bg: "#ecfdf5" },
            { label: "Districts",     value: contributor.stats.districts_covered, color: "#1d4ed8", bg: "#eff6ff" },
            { label: "Reviews",       value: contributor.stats.total_reviews,    color: "#d97706", bg: "#fffbeb" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 ? (
        <div style={{ margin: "16px 0 0", background: "#fff", borderRadius: 20, padding: "18px", border: "1.5px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🎖️</span>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Badges &amp; Achievements</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {achievements.map((a) => (
              <div key={a.name} style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "14px 12px" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{a.emoji}</div>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 2 }}>{a.name}</p>
                <p style={{ fontSize: 11, color: "#059669" }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Districts Covered */}
      {districts.length > 0 ? (
        <div style={{ margin: "16px 0 0", background: "#fff", borderRadius: 20, padding: "18px", border: "1.5px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>📍</span>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Districts Covered</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {districts.map((d) => (
              <Link key={d.id} href={`/districts/${d.slug || d.id}`} style={{ fontSize: 12, fontWeight: 600, color: "#065f46", background: "#ecfdf5", borderRadius: 999, padding: "5px 12px", textDecoration: "none", border: "1.5px solid #bbf7d0" }}>
                {d.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* Recent Contributions */}
      <div style={{ margin: "16px 0 32px" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>Recent Contributions</h2>

        {contributor.places.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", background: "#fff", borderRadius: 16, border: "1.5px dashed #e2e8f0" }}>
            <p style={{ fontSize: 14, color: "#6b7280" }}>No approved places yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contributor.places.map((place) => (
              <Link
                key={place.slug}
                href={`/place/${place.slug}`}
                style={{ textDecoration: "none", background: "#fff", borderRadius: 16, border: "1.5px solid #f1f5f9", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}
              >
                {place.cover_image_url ? (
                  <div style={{ position: "relative", width: 60, height: 60, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                    <Image src={place.cover_image_url} alt={place.name} fill sizes="60px" className="object-cover" />
                  </div>
                ) : (
                  <div style={{ width: 60, height: 60, borderRadius: 12, background: "#f0fdf4", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏔️</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#059669", marginBottom: 2 }}>
                    {CATEGORY_LABELS[place.category] || place.category}
                  </p>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 3 }}>{place.name}</p>
                  <p style={{ fontSize: 12, color: "#64748b" }}>📍 {place.district_name}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#d97706", background: "#fffbeb", borderRadius: 999, padding: "3px 8px", marginBottom: 4 }}>
                    ⭐ {Number(place.rating).toFixed(1)}
                  </div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{place.review_count} reviews</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
