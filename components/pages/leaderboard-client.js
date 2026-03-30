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

  function handlePeriod(p) {
    setPeriod(p);
    fetchData(p, districtId);
  }

  function handleDistrict(d) {
    setDistrictId(d);
    fetchData(period, d);
  }

  const leaders = data?.leaders || [];
  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  const myRank = data?.myRank;
  const districts = data?.districts || [];

  // Podium order: 2nd left, 1st center, 3rd right
  const podium = [top3[1], top3[0], top3[2]];
  const podiumHeights = ["88px", "112px", "72px"];
  const podiumRanks = [2, 1, 3];

  return (
    <AppShell>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #059669 0%, #065f46 100%)", margin: "-24px -1px 0", padding: "28px 20px 32px", borderRadius: "0 0 28px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>Leaderboard</h1>
          <span style={{ fontSize: 24 }}>🏆</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Top contributors making Nepal accessible to everyone</p>

        {/* Period tabs */}
        <div style={{ display: "flex", gap: 6, marginTop: 18, background: "rgba(0,0,0,0.18)", borderRadius: 999, padding: 4 }}>
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handlePeriod(key)}
              style={{ flex: 1, padding: "8px 4px", borderRadius: 999, border: "none", background: period === key ? "#fff" : "transparent", color: period === key ? "#059669" : "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px 32px" }}>
        {/* District filter */}
        <div style={{ margin: "20px 0 24px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Filter by District</p>
          <select
            value={districtId}
            onChange={(e) => handleDistrict(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0f172a", background: "#fff", outline: "none" }}
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 14 }}>Loading...</div>
        ) : leaders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 14 }}>No contributors yet for this period.</div>
        ) : (
          <>
            {/* Podium */}
            {top3.length > 0 ? (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#059669", marginBottom: 16 }}>Top Contributors</p>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12 }}>
                  {podium.map((leader, idx) => {
                    if (!leader) return null;
                    const rank = podiumRanks[idx];
                    const isFirst = rank === 1;
                    const avatarSize = isFirst ? 72 : 56;
                    return (
                      <Link
                        key={leader.id}
                        href={`/contributors/${contributorSlug(leader.name, leader.id)}`}
                        style={{ flex: 1, maxWidth: 120, display: "flex", flexDirection: "column", alignItems: "center", textDecoration: "none" }}
                      >
                        <div style={{ position: "relative", marginBottom: 8 }}>
                          <div style={{ border: isFirst ? "3px solid #059669" : "2px solid #e2e8f0", borderRadius: "50%", padding: 2 }}>
                            <Avatar src={leader.avatar_url} name={leader.name} size={avatarSize} />
                          </div>
                          <div style={{ position: "absolute", bottom: -4, right: -4, fontSize: isFirst ? 22 : 18, lineHeight: 1 }}>
                            {MEDAL[rank - 1]}
                          </div>
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
            ) : null}

            {/* Ranked list #4+ */}
            {rest.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rest.map((leader, idx) => {
                  const rank = idx + 4;
                  const badge = BADGE_COLORS[leader.badge_level] || BADGE_COLORS.explorer;
                  return (
                    <Link
                      key={leader.id}
                      href={`/contributors/${contributorSlug(leader.name, leader.id)}`}
                      style={{ textDecoration: "none", background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}
                    >
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
            ) : null}
          </>
        )}

        {/* My rank footer */}
        {myRank ? (
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
        ) : null}
      </div>
    </AppShell>
  );
}
