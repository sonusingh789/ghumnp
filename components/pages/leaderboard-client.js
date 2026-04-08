"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/layout/app-shell";

const PERIODS = [
  { key: "week",  label: "This Week"  },
  { key: "month", label: "This Month" },
  { key: "all",   label: "All Time"   },
];

const BADGE_COLORS = {
  explorer:    { color: "#64748b", bg: "#f1f5f9" },
  contributor: { color: "#1d4ed8", bg: "#eff6ff" },
  local_guide: { color: "#059669", bg: "#ecfdf5" },
  champion:    { color: "#d97706", bg: "#fffbeb" },
  pioneer:     { color: "#7c3aed", bg: "#f5f3ff" },
};

const MEDAL = ["🥇", "🥈", "🥉"];

function contributorSlug(name, id) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${id}`;
}

function Avatar({ src, name, size = 56 }) {
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: "50%", overflow: "hidden", background: "#d1fae5", flexShrink: 0 }}>
      {src ? (
        <Image src={src} alt={name} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 800, color: "#059669" }}>
          {name?.[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
}

export default function LeaderboardClient({ initialData, initialPeriod }) {
  const [period, setPeriod] = useState(initialPeriod || "month");
  const [districtId, setDistrictId] = useState("");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  async function fetchData(p, d) {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?period=${p}${d ? `&district_id=${d}` : ""}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  function handlePeriod(p) { setPeriod(p); fetchData(p, districtId); }
  function handleDistrict(d) { setDistrictId(d); fetchData(period, d); }

  const leaders = data?.leaders || [];
  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  const myRank = data?.myRank;
  const districts = data?.districts || [];

  const podium = [top3[1], top3[0], top3[2]];
  const podiumHeights = ["88px", "112px", "72px"];
  const podiumRanks = [2, 1, 3];

  return (
    <AppShell>

      {/* ════════════════════════════════════════════════════════
          DESKTOP LAYOUT
      ════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block">

        {/* Header */}
        <div style={{
          background: "linear-gradient(105deg, #059669 0%, #065f46 100%)",
          borderRadius: 24, padding: "36px 40px",
          position: "relative", overflow: "hidden", marginBottom: 32,
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                <h1 style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.025em" }}>Leaderboard</h1>
                <span style={{ fontSize: 36 }}>🏆</span>
              </div>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.6, maxWidth: 440 }}>
                Top contributors making Nepal accessible to everyone, one place at a time.
              </p>
            </div>
            {/* Period tabs */}
            <div style={{ display: "flex", gap: 6, background: "rgba(0,0,0,0.18)", borderRadius: 999, padding: 4, flexShrink: 0 }}>
              {PERIODS.map(({ key, label }) => (
                <button key={key} type="button" onClick={() => handlePeriod(key)}
                  style={{ padding: "9px 20px", borderRadius: 999, border: "none", background: period === key ? "#fff" : "transparent", color: period === key ? "#059669" : "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Two-column: main + aside */}
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>

          {/* ── Main ──────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8", fontSize: 15 }}>Loading...</div>
            ) : leaders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8", fontSize: 15 }}>No contributors yet for this period.</div>
            ) : (
              <>
                {/* Podium */}
                {top3.length > 0 && (
                  <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", padding: "32px 24px", marginBottom: 24, boxShadow: "0 4px 20px rgba(15,23,42,0.06)" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#059669", marginBottom: 28, textAlign: "center" }}>Top Contributors</p>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 20 }}>
                      {podium.map((leader, idx) => {
                        if (!leader) return null;
                        const rank = podiumRanks[idx];
                        const isFirst = rank === 1;
                        const avatarSize = isFirst ? 84 : 64;
                        return (
                          <Link key={leader.id} href={`/contributors/${contributorSlug(leader.name, leader.id)}`}
                            style={{ flex: 1, maxWidth: 160, display: "flex", flexDirection: "column", alignItems: "center", textDecoration: "none" }}>
                            <div style={{ position: "relative", marginBottom: 10 }}>
                              <div style={{ border: isFirst ? "3px solid #059669" : "2px solid #e2e8f0", borderRadius: "50%", padding: 3 }}>
                                <Avatar src={leader.avatar_url} name={leader.name} size={avatarSize} />
                              </div>
                              <div style={{ position: "absolute", bottom: -4, right: -4, fontSize: isFirst ? 26 : 20, lineHeight: 1 }}>{MEDAL[rank - 1]}</div>
                            </div>
                            <div style={{ background: isFirst ? "linear-gradient(135deg, #ecfdf5, #d1fae5)" : "#f8fafc", border: `1.5px solid ${isFirst ? "#6ee7b7" : "#e2e8f0"}`, borderRadius: 16, padding: "12px 10px", width: "100%", textAlign: "center", height: podiumHeights[idx], display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                              <p style={{ fontWeight: 800, fontSize: 14, color: isFirst ? "#065f46" : "#0f172a", lineHeight: 1.2, marginBottom: 4 }}>{leader.name}</p>
                              <p style={{ fontSize: 12, color: "#64748b" }}>{leader.contributions} places</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ranked list #4+ */}
                {rest.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {rest.map((leader, idx) => {
                      const rank = idx + 4;
                      const badge = BADGE_COLORS[leader.badge_level] || BADGE_COLORS.explorer;
                      return (
                        <Link key={leader.id} href={`/contributors/${contributorSlug(leader.name, leader.id)}`}
                          style={{ textDecoration: "none", background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                          <div style={{ width: 32, textAlign: "center", fontWeight: 800, fontSize: 15, color: "#94a3b8", flexShrink: 0 }}>{rank}</div>
                          <Avatar src={leader.avatar_url} name={leader.name} size={44} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{leader.name}</p>
                            <p style={{ fontSize: 13, color: "#64748b" }}>{leader.contributions} contributions · {leader.verified_count} verified</p>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: badge.color, background: badge.bg, borderRadius: 999, padding: "4px 12px", flexShrink: 0, textTransform: "capitalize" }}>
                            {leader.badge_level?.replace("_", " ")}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* My rank */}
                {myRank && (
                  <div style={{ marginTop: 24, background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "1.5px solid #6ee7b7", borderRadius: 18, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b", marginBottom: 4 }}>Your Current Rank</p>
                      <p style={{ fontSize: 32, fontWeight: 900, color: "#059669", lineHeight: 1 }}>#{myRank.rank}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b", marginBottom: 4 }}>Contributions</p>
                      <p style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{myRank.contributions}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <div style={{ width: 280, flexShrink: 0, position: "sticky", top: 24 }}>

            {/* District filter */}
            <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", padding: "18px", boxShadow: "0 2px 10px rgba(15,23,42,0.04)", marginBottom: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12 }}>Filter by District</p>
              <select value={districtId} onChange={(e) => handleDistrict(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0f172a", background: "#fff", outline: "none" }}>
                <option value="">All Districts</option>
                {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            {/* CTA */}
            <div style={{ background: "linear-gradient(135deg, #064e35 0%, #059669 100%)", borderRadius: 18, padding: "22px 20px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
              <span style={{ fontSize: 28 }}>🗺️</span>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginTop: 10, marginBottom: 6, lineHeight: 1.2 }}>Know a hidden gem?</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 16, lineHeight: 1.6 }}>Add places and climb the leaderboard.</p>
              <Link href="/add" style={{ display: "block", textAlign: "center", background: "#fff", color: "#059669", borderRadius: 12, padding: "11px 16px", fontSize: 13, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
                + Add a Place
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          MOBILE LAYOUT — untouched
      ════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        <div style={{ background: "linear-gradient(135deg, #059669 0%, #065f46 100%)", margin: "-24px -1px 0", padding: "28px 20px 32px", borderRadius: "0 0 28px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>Leaderboard</h1>
            <span style={{ fontSize: 24 }}>🏆</span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Top contributors making Nepal accessible to everyone</p>
          <div style={{ display: "flex", gap: 6, marginTop: 18, background: "rgba(0,0,0,0.18)", borderRadius: 999, padding: 4 }}>
            {PERIODS.map(({ key, label }) => (
              <button key={key} type="button" onClick={() => handlePeriod(key)}
                style={{ flex: 1, padding: "8px 4px", borderRadius: 999, border: "none", background: period === key ? "#fff" : "transparent", color: period === key ? "#059669" : "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 16px 32px" }}>
          <div style={{ margin: "20px 0 24px" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Filter by District</p>
            <select value={districtId} onChange={(e) => handleDistrict(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0f172a", background: "#fff", outline: "none" }}>
              <option value="">All Districts</option>
              {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 14 }}>Loading...</div>
          ) : leaders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 14 }}>No contributors yet for this period.</div>
          ) : (
            <>
              {top3.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#059669", marginBottom: 16 }}>Top Contributors</p>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12 }}>
                    {podium.map((leader, idx) => {
                      if (!leader) return null;
                      const rank = podiumRanks[idx];
                      const isFirst = rank === 1;
                      const avatarSize = isFirst ? 72 : 56;
                      return (
                        <Link key={leader.id} href={`/contributors/${contributorSlug(leader.name, leader.id)}`}
                          style={{ flex: 1, maxWidth: 120, display: "flex", flexDirection: "column", alignItems: "center", textDecoration: "none" }}>
                          <div style={{ position: "relative", marginBottom: 8 }}>
                            <div style={{ border: isFirst ? "3px solid #059669" : "2px solid #e2e8f0", borderRadius: "50%", padding: 2 }}>
                              <Avatar src={leader.avatar_url} name={leader.name} size={avatarSize} />
                            </div>
                            <div style={{ position: "absolute", bottom: -4, right: -4, fontSize: isFirst ? 22 : 18, lineHeight: 1 }}>{MEDAL[rank - 1]}</div>
                          </div>
                          <div style={{ background: isFirst ? "#ecfdf5" : "#f8fafc", border: `1.5px solid ${isFirst ? "#6ee7b7" : "#e2e8f0"}`, borderRadius: 16, padding: "10px 8px", width: "100%", textAlign: "center", height: podiumHeights[idx], display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <p style={{ fontWeight: 800, fontSize: 13, color: isFirst ? "#065f46" : "#0f172a", lineHeight: 1.2, marginBottom: 4 }}>{leader.name}</p>
                            <p style={{ fontSize: 11, color: "#64748b" }}>{leader.contributions} places</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
              {rest.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {rest.map((leader, idx) => {
                    const rank = idx + 4;
                    const badge = BADGE_COLORS[leader.badge_level] || BADGE_COLORS.explorer;
                    return (
                      <Link key={leader.id} href={`/contributors/${contributorSlug(leader.name, leader.id)}`}
                        style={{ textDecoration: "none", background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 28, textAlign: "center", fontWeight: 800, fontSize: 14, color: "#94a3b8", flexShrink: 0 }}>{rank}</div>
                        <Avatar src={leader.avatar_url} name={leader.name} size={40} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{leader.name}</p>
                          <p style={{ fontSize: 12, color: "#64748b" }}>{leader.contributions} contributions · {leader.verified_count} verified</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: badge.color, background: badge.bg, borderRadius: 999, padding: "3px 10px", flexShrink: 0, textTransform: "capitalize" }}>
                          {leader.badge_level?.replace("_", " ")}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
              {myRank && (
                <div style={{ marginTop: 24, background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "1.5px solid #6ee7b7", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b", marginBottom: 2 }}>Your Current Rank</p>
                    <p style={{ fontSize: 28, fontWeight: 900, color: "#059669", lineHeight: 1 }}>#{myRank.rank}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b", marginBottom: 2 }}>Contributions</p>
                    <p style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{myRank.contributions}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </AppShell>
  );
}
