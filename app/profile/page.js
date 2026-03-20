"use client";

import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/layout/app-shell";
import { useFavorites } from "@/context/favorites-context";
import { contributionItems, places, userProfile } from "@/data/nepal";

export default function ProfilePage() {
  const { favorites } = useFavorites();
  const savedPlaces = places.filter((p) => favorites.includes(p.id)).slice(0, 4);
  const recentReviews = places.flatMap((p) =>
    (p.reviews || []).map((r) => ({ ...r, placeName: p.name }))
  );

  return (
    <AppShell noPadding>
      {/* Hero banner */}
      <div className="fade-up" style={{ background: "linear-gradient(135deg, var(--jade) 0%, #0d4a28 100%)", padding: "36px 20px 80px", position: "relative", overflow: "hidden" }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Traveler Profile</div>
            <h1 className="display" style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>My Profile</h1>
          </div>
          <button type="button" style={{ width: 40, height: 40, borderRadius: "50%", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }} aria-label="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 1 0 12 8.5z" />
              <path d="m19 12 1.7 1-1.6 2.8-2-.5a7.9 7.9 0 0 1-1.4 1.4l.5 2-2.8 1.6-1-1.7a7.8 7.8 0 0 1-2 0l-1 1.7-2.8-1.6.5-2a7.9 7.9 0 0 1-1.4-1.4l-2 .5L3.3 13 5 12a7.8 7.8 0 0 1 0-2l-1.7-1 1.6-2.8 2 .5a7.9 7.9 0 0 1 1.4-1.4l-.5-2L10.6 1.7l1 1.7a7.8 7.8 0 0 1 2 0l1-1.7 2.8 1.6-.5 2a7.9 7.9 0 0 1 1.4 1.4l2-.5L20.7 9 19 10a7.8 7.8 0 0 1 0 2Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Profile card */}
      <div className="fade-up-1" style={{ margin: "0 16px", marginTop: -52, position: "relative", zIndex: 10 }}>
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--jade-soft)", boxShadow: "0 4px 16px var(--jade-glow)", position: "relative" }}>
                <Image src={userProfile.avatar} alt={userProfile.name} fill sizes="72px" className="object-cover" />
              </div>
              <button type="button" style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", border: "2px solid var(--bg-card)", background: "var(--jade)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} aria-label="Change photo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
                  <path d="M5 8h3l1.4-2h5.2L16 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="display" style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>{userProfile.name}</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>{userProfile.bio}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "Contributions", value: userProfile.stats.contributions, color: "var(--jade)" },
              { label: "Saved", value: favorites.length, color: "#e53535" },
              { label: "Reviews", value: userProfile.stats.reviews, color: "var(--gold)" },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--bg)", borderRadius: "var(--radius-md)", padding: "14px 10px", textAlign: "center" }}>
                <div className="display" style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contributions */}
      <div className="fade-up-2" style={{ margin: "16px 16px 0" }}>
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 className="display" style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>My Contributions</h2>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--jade)", cursor: "pointer" }}>View All →</span>
          </div>
          {contributionItems.map((item, i) => (
            <div key={item.id} style={{ padding: "14px 20px", borderBottom: i < contributionItems.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--jade-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: "var(--jade)" }}>
                  <path d="M12 21s6-5.8 6-11a6 6 0 1 0-12 0c0 5.2 6 11 6 11Z" /><circle cx="12" cy="10" r="2.3" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 1 }}>{item.location} · {item.dateLabel}</div>
              </div>
              <span style={{
                borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, flexShrink: 0,
                background: item.status === "Published" ? "var(--jade-soft)" : "var(--gold-soft)",
                color: item.status === "Published" ? "var(--jade)" : "var(--gold)",
              }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Saved places */}
      {savedPlaces.length > 0 && (
        <div className="fade-up-3" style={{ margin: "16px 16px 0" }}>
          <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 className="display" style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>Saved Places</h2>
              <Link href="/favorites" style={{ fontSize: 12, fontWeight: 700, color: "var(--jade)" }}>See all →</Link>
            </div>
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {savedPlaces.map((place) => (
                <Link key={place.id} href={`/place/${place.id}`} style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)", display: "block" }}>
                  <div style={{ position: "relative", height: 90 }}>
                    <Image src={place.image} alt={place.name} fill sizes="180px" className="object-cover" />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,26,15,0.65) 0%, transparent 55%)" }} />
                  </div>
                  <div style={{ padding: "8px 10px", background: "var(--bg-card)" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "var(--ink)", lineHeight: 1.3 }} className="line-clamp-2">{place.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      {recentReviews.length > 0 && (
        <div className="fade-up-4" style={{ margin: "16px 16px 24px" }}>
          <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <h2 className="display" style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>Recent Reviews</h2>
            </div>
            {recentReviews.slice(0, 3).map((r, i) => (
              <div key={r.id} style={{ padding: "14px 20px", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{r.placeName}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 1 }}>{r.author}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, background: "var(--gold-soft)", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: "var(--gold)" }}>
                    ★ {r.rating}.0
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
