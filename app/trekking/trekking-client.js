"use client";

import { useState } from "react";
import Link from "next/link";

const TREKS = [
  {
    id: "ebc",
    name: "Everest Base Camp",
    tagline: "Walk in the shadow of the world's highest peak",
    district: "Solukhumbu",
    days: "12–14 days",
    difficulty: "Hard",
    maxElevation: "5,364 m",
    startPoint: "Lukla",
    endPoint: "EBC",
    season: "Mar–May · Sep–Nov",
    href: "/districts/solukhumbu",
    color: "#0369a1",
    lightColor: "#e0f2fe",
    waypoints: [
      { label: "Lukla",       x: 8,  y: 72 },
      { label: "Namche",      x: 24, y: 58 },
      { label: "Tengboche",   x: 40, y: 52 },
      { label: "Dingboche",   x: 56, y: 45 },
      { label: "Lobuche",     x: 72, y: 36 },
      { label: "Gorak Shep",  x: 84, y: 28 },
      { label: "EBC",         x: 92, y: 22 },
    ],
    mountains: [
      { label: "Everest 8,849m", x: 88, y: 8 },
      { label: "Lhotse 8,516m",  x: 74, y: 14 },
    ],
  },
  {
    id: "annapurna",
    name: "Annapurna Circuit",
    tagline: "Nepal's most diverse and dramatic loop trek",
    district: "Kaski / Manang",
    days: "15–20 days",
    difficulty: "Hard",
    maxElevation: "5,416 m",
    startPoint: "Besisahar",
    endPoint: "Pokhara",
    season: "Mar–May · Oct–Nov",
    href: "/districts/kaski",
    color: "#7c3aed",
    lightColor: "#ede9fe",
    waypoints: [
      { label: "Besisahar",   x: 8,  y: 75 },
      { label: "Chame",       x: 24, y: 60 },
      { label: "Manang",      x: 40, y: 48 },
      { label: "Thorong La",  x: 55, y: 22 },
      { label: "Muktinath",   x: 70, y: 38 },
      { label: "Jomsom",      x: 82, y: 50 },
      { label: "Pokhara",     x: 93, y: 72 },
    ],
    mountains: [
      { label: "Annapurna I 8,091m", x: 46, y: 8 },
      { label: "Thorong La 5,416m",  x: 55, y: 14 },
    ],
  },
  {
    id: "langtang",
    name: "Langtang Valley",
    tagline: "The valley of glaciers, close to Kathmandu",
    district: "Rasuwa",
    days: "7–10 days",
    difficulty: "Moderate",
    maxElevation: "3,870 m",
    startPoint: "Syabrubesi",
    endPoint: "Kyanjin Gompa",
    season: "Mar–May · Oct–Nov",
    href: "/districts/rasuwa",
    color: "#059669",
    lightColor: "#d1fae5",
    waypoints: [
      { label: "Syabrubesi",   x: 8,  y: 78 },
      { label: "Lama Hotel",   x: 28, y: 62 },
      { label: "Langtang",     x: 52, y: 44 },
      { label: "Kyanjin",      x: 76, y: 35 },
      { label: "Tsergo Ri",    x: 90, y: 22 },
    ],
    mountains: [
      { label: "Langtang Lirung 7,227m", x: 70, y: 10 },
    ],
  },
  {
    id: "poonhill",
    name: "Ghorepani Poon Hill",
    tagline: "Best sunrise panorama over the Annapurna range",
    district: "Myagdi",
    days: "4–5 days",
    difficulty: "Easy",
    maxElevation: "3,210 m",
    startPoint: "Nayapul",
    endPoint: "Ghandruk",
    season: "Year-round",
    href: "/districts/myagdi",
    color: "#d97706",
    lightColor: "#fef3c7",
    waypoints: [
      { label: "Nayapul",    x: 8,  y: 80 },
      { label: "Ulleri",     x: 28, y: 58 },
      { label: "Ghorepani",  x: 50, y: 40 },
      { label: "Poon Hill",  x: 60, y: 28 },
      { label: "Tadapani",   x: 75, y: 45 },
      { label: "Ghandruk",   x: 92, y: 62 },
    ],
    mountains: [
      { label: "Dhaulagiri 8,167m", x: 40, y: 10 },
      { label: "Machhapuchhre 6,993m", x: 72, y: 12 },
    ],
  },
  {
    id: "manaslu",
    name: "Manaslu Circuit",
    tagline: "Remote, raw and rarely crowded Himalayan circuit",
    district: "Gorkha",
    days: "14–18 days",
    difficulty: "Hard",
    maxElevation: "5,160 m",
    startPoint: "Arughat",
    endPoint: "Bimthang",
    season: "Mar–May · Sep–Nov",
    href: "/districts/gorkha",
    color: "#dc2626",
    lightColor: "#fee2e2",
    waypoints: [
      { label: "Arughat",   x: 8,  y: 78 },
      { label: "Jagat",     x: 26, y: 65 },
      { label: "Samagaon",  x: 48, y: 48 },
      { label: "Samdo",     x: 60, y: 38 },
      { label: "Larkya La", x: 72, y: 22 },
      { label: "Bimthang",  x: 88, y: 42 },
    ],
    mountains: [
      { label: "Manaslu 8,163m", x: 55, y: 8 },
    ],
  },
  {
    id: "mustang",
    name: "Upper Mustang",
    tagline: "The forbidden kingdom beyond the Himalayas",
    district: "Mustang",
    days: "12–16 days",
    difficulty: "Moderate",
    maxElevation: "3,840 m",
    startPoint: "Jomsom",
    endPoint: "Lo Manthang",
    season: "May–Oct",
    href: "/districts/mustang",
    color: "#b45309",
    lightColor: "#fef3c7",
    waypoints: [
      { label: "Jomsom",      x: 8,  y: 72 },
      { label: "Kagbeni",     x: 24, y: 62 },
      { label: "Chele",       x: 42, y: 50 },
      { label: "Ghami",       x: 60, y: 44 },
      { label: "Tsarang",     x: 76, y: 38 },
      { label: "Lo Manthang", x: 90, y: 32 },
    ],
    mountains: [
      { label: "Nilgiri 7,061m", x: 14, y: 12 },
    ],
  },
];

const DIFFICULTY_STYLE = {
  Easy:     { bg: "#dcfce7", color: "#15803d" },
  Moderate: { bg: "#fef9c3", color: "#a16207" },
  Hard:     { bg: "#fee2e2", color: "#dc2626" },
};

/* ── SVG Route Map ─────────────────────────────────────── */
function RouteMap({ trek, compact = false }) {
  const h = compact ? 90 : 130;
  const pts = trek.waypoints;

  // Build smooth path through waypoints
  const path = pts.map((p, i) => {
    const px = (p.x / 100) * 280 + 10;
    const py = (p.y / 100) * (h - 20) + 10;
    if (i === 0) return `M ${px} ${py}`;
    const prev = pts[i - 1];
    const ppx = (prev.x / 100) * 280 + 10;
    const ppy = (prev.y / 100) * (h - 20) + 10;
    const cx1 = ppx + (px - ppx) * 0.5;
    const cy1 = ppy;
    const cx2 = ppx + (px - ppx) * 0.5;
    const cy2 = py;
    return `C ${cx1} ${cy1} ${cx2} ${cy2} ${px} ${py}`;
  }).join(" ");

  // Mountain silhouette background
  const mtnPts = [
    `0,${h}`, `0,${h * 0.7}`,
    `40,${h * 0.55}`, `80,${h * 0.35}`, `140,${h * 0.25}`,
    `180,${h * 0.38}`, `220,${h * 0.28}`, `260,${h * 0.18}`,
    `300,${h * 0.32}`, `300,${h}`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 300 ${h}`} style={{ width: "100%", height: compact ? 90 : 130, display: "block" }}>
      {/* Sky gradient */}
      <defs>
        <linearGradient id={`sky-${trek.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trek.lightColor} />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
        <linearGradient id={`route-${trek.id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={trek.color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={trek.color} />
        </linearGradient>
      </defs>
      <rect width="300" height={h} fill={`url(#sky-${trek.id})`} />

      {/* Mountain silhouette */}
      <polygon points={mtnPts} fill="rgba(148,163,184,0.18)" />
      <polygon
        points={`0,${h} 0,${h*0.62} 60,${h*0.42} 110,${h*0.32} 160,${h*0.22} 200,${h*0.30} 240,${h*0.20} 280,${h*0.30} 300,${h*0.38} 300,${h}`}
        fill="rgba(148,163,184,0.12)"
      />

      {/* Snow caps */}
      {!compact && trek.mountains.map(m => (
        <g key={m.label}>
          <text
            x={(m.x / 100) * 280 + 10}
            y={(m.y / 100) * (h - 20) + 10}
            fontSize="6"
            fill={trek.color}
            textAnchor="middle"
            fontWeight="600"
            opacity="0.7"
          >
            {m.label}
          </text>
        </g>
      ))}

      {/* Route path (shadow) */}
      <path d={path} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Route path */}
      <path d={path} fill="none" stroke={`url(#route-${trek.id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Waypoint dots + labels */}
      {pts.map((p, i) => {
        const px = (p.x / 100) * 280 + 10;
        const py = (p.y / 100) * (h - 20) + 10;
        const isFirst = i === 0;
        const isLast  = i === pts.length - 1;
        const labelY  = py > h * 0.55 ? py - 8 : py + 14;
        return (
          <g key={p.label}>
            <circle cx={px} cy={py} r={isFirst || isLast ? 5 : 3.5} fill="#fff" stroke={trek.color} strokeWidth="1.5" />
            {isFirst || isLast ? (
              <circle cx={px} cy={py} r={2} fill={trek.color} />
            ) : null}
            {!compact && (
              <text x={px} y={labelY} fontSize="6.5" fill="#334155" textAnchor="middle" fontWeight={isFirst || isLast ? "700" : "500"}>
                {p.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Start / End labels on compact */}
      {compact && (
        <>
          <text x={(pts[0].x/100)*280+10} y={h-4} fontSize="7" fill={trek.color} textAnchor="middle" fontWeight="700">{pts[0].label}</text>
          <text x={(pts[pts.length-1].x/100)*280+10} y={h-4} fontSize="7" fill={trek.color} textAnchor="middle" fontWeight="700">{pts[pts.length-1].label}</text>
        </>
      )}
    </svg>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function TrekkingClient() {
  const [selected, setSelected] = useState(TREKS[0]);
  const diff = DIFFICULTY_STYLE[selected.difficulty];

  return (
    <div style={{ paddingBottom: 48 }}>

      {/* ── FEATURED TREK ─────────────────────────────── */}
      <div style={{ margin: "20px 0 0", background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(15,23,42,0.07)" }}>

        {/* Route map */}
        <div style={{ background: selected.lightColor, padding: "16px 16px 8px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 8, right: 12, display: "flex", gap: 6, zIndex: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: diff.bg, color: diff.color, borderRadius: 999, padding: "3px 8px" }}>
              {selected.difficulty}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.8)", color: "#475569", borderRadius: 999, padding: "3px 8px" }}>
              {selected.days}
            </span>
          </div>
          <RouteMap trek={selected} compact={false} />
        </div>

        {/* Trek detail */}
        <div style={{ padding: "14px 20px 16px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginBottom: 4, letterSpacing: "-0.02em" }}>
            {selected.name}
          </h2>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, lineHeight: 1.5 }}>
            {selected.tagline}
          </p>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              { icon: "🏔️", label: "Max Elevation", value: selected.maxElevation },
              { icon: "📍", label: "Start",          value: selected.startPoint   },
              { icon: "🗓",  label: "Best Season",   value: selected.season       },
            ].map(s => (
              <div key={s.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                <p style={{ fontSize: 14, marginBottom: 2 }}>{s.icon}</p>
                <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Waypoints trail */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Route</p>
            <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
              {selected.waypoints.map((wp, i) => (
                <div key={wp.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{
                      width: i === 0 || i === selected.waypoints.length - 1 ? 10 : 7,
                      height: i === 0 || i === selected.waypoints.length - 1 ? 10 : 7,
                      borderRadius: "50%",
                      background: i === 0 || i === selected.waypoints.length - 1 ? selected.color : "#fff",
                      border: `2px solid ${selected.color}`,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 9, color: "#475569", fontWeight: i === 0 || i === selected.waypoints.length - 1 ? 700 : 500, whiteSpace: "nowrap" }}>
                      {wp.label}
                    </span>
                  </div>
                  {i < selected.waypoints.length - 1 && (
                    <div style={{ width: 18, height: 2, background: `${selected.color}40`, marginBottom: 12, flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Link href={selected.href}
            style={{ display: "block", textAlign: "center", background: selected.color, color: "#fff", borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Explore {selected.district} District →
          </Link>
        </div>
      </div>

      {/* ── TREK SELECTOR ─────────────────────────────── */}
      <div style={{ padding: "24px 0 0" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#059669", marginBottom: 12 }}>
          All Popular Treks
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TREKS.map(trek => {
            const d = DIFFICULTY_STYLE[trek.difficulty];
            const isActive = trek.id === selected.id;
            return (
              <button key={trek.id} onClick={() => setSelected(trek)}
                style={{ background: isActive ? trek.lightColor : "#fff", border: `1.5px solid ${isActive ? trek.color : "#f1f5f9"}`, borderRadius: 16, padding: 0, overflow: "hidden", textAlign: "left", cursor: "pointer", boxShadow: isActive ? `0 4px 16px ${trek.color}22` : "0 2px 8px rgba(15,23,42,0.04)", transition: "all 0.2s" }}>
                <div style={{ padding: "0 12px 0" }}>
                  <RouteMap trek={trek} compact={true} />
                </div>
                <div style={{ padding: "8px 14px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: isActive ? trek.color : "#0f172a", marginBottom: 2 }}>{trek.name}</p>
                    <p style={{ fontSize: 11, color: "#6b7280" }}>{trek.district} · {trek.days}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: d.bg, color: d.color, borderRadius: 999, padding: "3px 8px" }}>
                      {trek.difficulty}
                    </span>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{trek.maxElevation}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────── */}
      <div style={{ padding: "24px 20px 0", display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Link href="/districts" style={{ flex: 1, textAlign: "center", background: "#059669", color: "#fff", borderRadius: 999, padding: "12px 20px", fontSize: 13, fontWeight: 700, textDecoration: "none", minWidth: 140 }}>
          Browse All Districts
        </Link>
        <Link href="/allplaces" style={{ flex: 1, textAlign: "center", background: "#fff", border: "1.5px solid #e2e8f0", color: "#0f172a", borderRadius: 999, padding: "12px 20px", fontSize: 13, fontWeight: 700, textDecoration: "none", minWidth: 140 }}>
          All Places
        </Link>
      </div>

    </div>
  );
}
